export interface CachedAsset {
  code: string;
  version: string;
  timestamp: number;
}

export class AnomotionBootloader {
  private static DB_NAME = 'anomotion-cache';
  private static STORE_NAME = 'builds';
  private static DB_VERSION = 1;

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

  static get(key: string): Promise<CachedAsset | null> {
    return this.getDB().then((db) => {
      return new Promise<CachedAsset | null>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    });
  }

  static set(key: string, asset: CachedAsset): Promise<void> {
    return this.getDB().then((db) => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.put(asset, key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
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

  /**
   * Resolve execution context. If offline, loads from IndexedDB directly.
   * If online & outdated, fetches from CDN and updates the cache.
   */
  static ready(version = '1.0.4', cdnUrl?: string): Promise<void> {
    const key = 'latest-bundle';
    const fallbackUrl = cdnUrl || `https://cdn.jsdelivr.net/npm/@eldrex/anomotionjs-core@${version}/dist/anomotion.min.js`;

    return this.get(key).then((cached) => {
      if (cached && cached.version === version) {
        this.injectScript(cached.code);
        return;
      }

      // Fetch fresh version
      return fetch(fallbackUrl)
        .then((res) => {
          if (!res.ok) throw new Error('CDN response failed');
          return res.text();
        })
        .then((code) => {
          const asset: CachedAsset = {
            code,
            version,
            timestamp: Date.now()
          };
          return this.set(key, asset).then(() => {
            this.injectScript(code);
          });
        })
        .catch((err) => {
          console.warn('Bootloader fallback: Fetching failed, attempting cache execution.', err);
          if (cached) {
            this.injectScript(cached.code);
          } else {
            throw new Error('No cache available and device is offline.');
          }
        });
    });
  }

  private static injectScript(code: string) {
    const blob = new Blob([code], { type: 'application/javascript' });
    const script = document.createElement('script');
    script.src = URL.createObjectURL(blob);
    document.head.appendChild(script);
  }
}
