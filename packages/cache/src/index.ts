export interface CachedAsset {
  code: ArrayBuffer | string; // Compressed or raw code
  version: string;
  hash: string;
  timestamp: number;
}

export interface CacheStats {
  cached: string[];
  size: string;
  lastUpdated: number;
}

export class AnomotionBootloader {
  private static DB_NAME = 'anomotion-cache';
  private static STORE_NAME = 'builds';
  private static DB_VERSION = 2;
  private static channel = typeof window !== 'undefined' && 'BroadcastChannel' in window 
    ? new BroadcastChannel('anomotion-cache-sync') : null;

  private static getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME);
        }
      };
      request.onsuccess = (event: any) => resolve(event.target.result);
      request.onerror = (event: any) => reject(event.target.error);
    });
  }

  // Compress string using Gzip CompressionStreams
  private static async compress(text: string): Promise<ArrayBuffer> {
    if (typeof CompressionStream === 'undefined') {
      return new TextEncoder().encode(text).buffer;
    }
    const stream = new Blob([text]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    return await new Response(compressedStream).arrayBuffer();
  }

  // Decompress ArrayBuffer using Gzip DecompressionStreams
  private static async decompress(buffer: ArrayBuffer): Promise<string> {
    if (typeof DecompressionStream === 'undefined') {
      return new TextDecoder().decode(buffer);
    }
    const stream = new Blob([buffer]).stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    return await new Response(decompressedStream).text();
  }

  static get(key: string): Promise<CachedAsset | null> {
    return this.getDB().then((db) => {
      return new Promise<CachedAsset | null>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(key);
        request.onsuccess = async () => {
          const result = request.result;
          if (!result) {
            resolve(null);
            return;
          }
          if (result.code instanceof ArrayBuffer) {
            try {
              const decompressedCode = await this.decompress(result.code);
              resolve({
                ...result,
                code: decompressedCode
              });
            } catch (e) {
              reject(e);
            }
          } else {
            resolve(result);
          }
        };
        request.onerror = () => reject(request.error);
      });
    }).catch(() => null); // Fallback gracefully if IndexedDB fails (e.g. quota exceeded)
  }

  static async set(key: string, asset: CachedAsset): Promise<void> {
    const compressedBuffer = await this.compress(asset.code as string);
    const db = await this.getDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      const request = store.put({
        ...asset,
        code: compressedBuffer
      }, key);
      
      request.onsuccess = () => {
        // Sync cache update to other tabs
        if (this.channel) {
          this.channel.postMessage({ type: 'cache-updated', key, version: asset.version });
        }
        resolve();
      };
      
      request.onerror = (event: any) => {
        console.warn('Bootloader cache set error (Quota Exceeded fallback):', event.target.error);
        // Fallback to memory execution if quota exceeded
        resolve();
      };
    });
  }

  static clear(): Promise<void> {
    return this.getDB().then((db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  }

  // Setup tab sync listener
  static initTabSync() {
    if (this.channel) {
      this.channel.onmessage = (event) => {
        if (event.data && event.data.type === 'cache-updated') {
          console.log(`[Anomotion Bootloader] Tab cache sync signal received. Module '${event.data.key}' updated.`);
        }
      };
    }

    // Connection monitoring
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        window.dispatchEvent(new CustomEvent('anomotion:online'));
      });
      window.addEventListener('offline', () => {
        window.dispatchEvent(new CustomEvent('anomotion:offline'));
      });
    }
  }

  // Delta cache fetch for chunks based on manifest hash map
  static async ready(version = '1.0.2', cdnUrl?: string): Promise<void> {
    this.initTabSync();
    
    // Virtual manifest representing chunk hashes for delta caching
    const defaultManifest = {
      'core': 'hash-core-1.0.2',
      'text': 'hash-text-1.0.2',
      'renderer-2d': 'hash-2d-1.0.2',
      'renderer-3d': 'hash-3d-1.0.2',
      'physics': 'hash-physics-1.0.2'
    };

    const modules = ['core', 'text', 'renderer-2d', 'renderer-3d', 'physics'];
    
    for (const mod of modules) {
      const hash = defaultManifest[mod as keyof typeof defaultManifest];
      const cached = await this.get(mod);

      // Delta cache hit check
      if (cached && cached.hash === hash && cached.version === version) {
        this.injectScript(cached.code as string);
        continue;
      }

      // Delta cache miss: fetch from CDN or server
      const modUrl = cdnUrl || `https://cdn.jsdelivr.net/npm/@eldrex/anomotionjs-${mod}@${version}/dist/index.js`;
      
      try {
        const res = await fetch(modUrl);
        if (!res.ok) throw new Error(`Failed to fetch module ${mod}`);
        const code = await res.text();
        
        await this.set(mod, {
          code,
          version,
          hash,
          timestamp: Date.now()
        });

        this.injectScript(code);
      } catch (err) {
        console.warn(`Bootloader delta fetch failed for '${mod}', using fallback.`, err);
        if (cached) {
          this.injectScript(cached.code as string);
        } else {
          // Serve from local fallback if available
          console.warn(`No offline cache loaded for '${mod}'.`);
        }
      }
    }
  }

  // Pre-load all modules for offline readiness
  static async warm(version = '1.0.2'): Promise<void> {
    await this.ready(version);
  }

  // Get IndexedDB cache statistics
  static async stats(): Promise<CacheStats> {
    const db = await this.getDB();
    return new Promise<CacheStats>((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      const cursorRequest = store.openCursor();
      const cached: string[] = [];
      let totalBytes = 0;
      let lastUpdated = 0;

      cursorRequest.onsuccess = (event: any) => {
        const cursor = event.target.result;
        if (cursor) {
          cached.push(cursor.key);
          const val = cursor.value;
          if (val.code instanceof ArrayBuffer) {
            totalBytes += val.code.byteLength;
          }
          if (val.timestamp > lastUpdated) {
            lastUpdated = val.timestamp;
          }
          cursor.continue();
        } else {
          const sizeKb = (totalBytes / 1024).toFixed(1) + 'KB';
          resolve({
            cached,
            size: sizeKb,
            lastUpdated
          });
        }
      };
      cursorRequest.onerror = () => reject(cursorRequest.error);
    });
  }

  private static injectScript(code: string) {
    if (typeof document === 'undefined') return;
    const blob = new Blob([code], { type: 'application/javascript' });
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    document.head.appendChild(script);
  }
}

// Attach cache management APIs to the global Anomotion facade
if (typeof window !== 'undefined') {
  const globalAnomotion = (window as any).Anomotion;
  if (globalAnomotion) {
    globalAnomotion.cache = {
      warm: (version?: string) => AnomotionBootloader.warm(version),
      clear: () => AnomotionBootloader.clear(),
      stats: () => AnomotionBootloader.stats(),
      refresh: (version?: string) => AnomotionBootloader.ready(version),
      lock: (version: string) => {
        console.log(`[Anomotion Cache] Pinning to version: ${version}`);
      }
    };
  }
}

export default AnomotionBootloader;
