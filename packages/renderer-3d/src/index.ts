import { Renderer, GlyphState, Anomotion } from '@eldrex/anomotionjs-core';
import * as THREE from 'three';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';

export class ThreeRenderer implements Renderer {
  public container: HTMLElement;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public glyphs: {
    group: THREE.Group;
    mesh: THREE.Mesh;
    char: string;
    width: number;
    height: number;
    initialX: number;
  }[] = [];
  
  private textGroup!: THREE.Group;
  private glowLight: THREE.PointLight | null = null;
  private isLoaded = false;
  private pendingText = '';
  
  private static cachedFont: Font | null = null;
  private static geometryCache = new Map<string, THREE.BufferGeometry>();
  private activeTextures: THREE.Texture[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.initThree();
  }

  private initThree() {
    const rect = this.container.getBoundingClientRect();
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, rect.width / (rect.height || 1), 0.1, 2000);
    this.camera.position.set(0, 0, 200);

    const rendererConfig = Anomotion.config.renderer;
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: rendererConfig.antialias, 
      alpha: true,
      powerPreference: rendererConfig.powerPreference as any
    });
    this.renderer.setSize(rect.width, rect.height);
    
    const dpr = rendererConfig.pixelRatio === 'auto' ? (window.devicePixelRatio || 1) : rendererConfig.pixelRatio;
    this.renderer.setPixelRatio(dpr);
    
    this.container.appendChild(this.renderer.domElement);

    this.textGroup = new THREE.Group();
    this.scene.add(this.textGroup);

    // Setup lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight1.position.set(0, 100, 200);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.4);
    dirLight2.position.set(-200, -100, -100);
    this.scene.add(dirLight2);

    this.glowLight = new THREE.PointLight(0xffffff, 0, 300);
    this.glowLight.position.set(0, 0, 50);
    this.scene.add(this.glowLight);
  }

  private createGradientTexture(stops: { offset: number; color: string }[] | string[]): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 256, 0);
    
    if (Array.isArray(stops) && typeof stops[0] === 'object') {
      (stops as any).forEach((s: any) => grad.addColorStop(s.offset, s.color));
    } else {
      const colors = stops as string[];
      colors.forEach((c, idx) => grad.addColorStop(idx / (colors.length - 1 || 1), c));
    }
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 1);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    this.activeTextures.push(texture);
    return texture;
  }

  private createMeshGradientMaterial(stops: { offset: number; color: string }[] | string[], type: 'linear' | 'radial' | 'conic', direction: number[]): THREE.ShaderMaterial {
    const texture = this.createGradientTexture(stops);
    const gradType = type === 'linear' ? 0 : type === 'radial' ? 1 : 2;

    return new THREE.ShaderMaterial({
      uniforms: {
        uGradientTexture: { value: texture },
        uDirection: { value: new THREE.Vector3(direction[0], direction[1], direction[2]) },
        uGradientType: { value: gradType },
        uOpacity: { value: 1.0 }
      },
      vertexShader: `
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uGradientTexture;
        uniform vec3 uDirection;
        uniform int uGradientType;
        uniform float uOpacity;
        varying vec3 vPosition;

        void main() {
          float t = 0.0;
          if (uGradientType == 0) {
            t = dot(vPosition, normalize(uDirection));
            t = (t + 10.0) / 20.0; // Normalized mapped distance
          } else if (uGradientType == 1) {
            t = length(vPosition) / 20.0;
          } else {
            float angle = atan(vPosition.y, vPosition.x);
            t = (angle + 3.14159) / (2.0 * 3.14159);
          }
          t = clamp(t, 0.0, 1.0);
          vec4 color = texture2D(uGradientTexture, vec2(t, 0.5));
          gl_FragColor = vec4(color.rgb, color.a * uOpacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
  }

  mount(text: string): void {
    this.pendingText = text;
    
    this.glyphs = text.split('').map((char) => ({
      group: new THREE.Group(),
      mesh: new THREE.Mesh(),
      char,
      width: 0,
      height: 0,
      initialX: 0
    }));

    if (ThreeRenderer.cachedFont) {
      this.buildGlyphMeshes(ThreeRenderer.cachedFont);
    } else {
      const loader = new FontLoader();
      const fontUrl = '/playground/helvetiker_regular.typeface.json';
      
      loader.load(
        fontUrl,
        (font) => {
          ThreeRenderer.cachedFont = font;
          this.buildGlyphMeshes(font);
        },
        undefined,
        (err) => {
          console.warn('ThreeRenderer: Failed to load font locally, attempting CDN fallback.', err);
          loader.load(
            'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json',
            (font) => {
              ThreeRenderer.cachedFont = font;
              this.buildGlyphMeshes(font);
            },
            undefined,
            (cdnErr) => {
              console.error('ThreeRenderer: Font load failed completely.', cdnErr);
            }
          );
        }
      );
    }
  }

  private buildGlyphMeshes(font: Font) {
    while (this.textGroup.children.length > 0) {
      this.textGroup.remove(this.textGroup.children[0]);
    }

    const text = this.pendingText;
    const fontSize = 16;
    const spacing = 1.2;

    const activeAnim = Anomotion.activeInstance;
    const style = activeAnim?.options.style;

    let currentX = 0;
    const tempGlyphs: typeof this.glyphs = [];

    // Resolve materials
    let material: THREE.Material;
    
    if (style && style.gradient) {
      const grad = style.gradient;
      const stops = grad.stops || grad.colors;
      const dir = (grad as any).direction || [1, 1, 0];
      material = this.createMeshGradientMaterial(stops, grad.type, dir);
    } else {
      material = new THREE.MeshStandardMaterial({
        color: style?.textColor ? new THREE.Color(style.textColor) : 0xf3f4f6,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
      });
    }

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const charGroup = new THREE.Group();
      let charMesh = new THREE.Mesh();
      let charWidth = fontSize * 0.6;
      let charHeight = fontSize;

      if (char !== ' ') {
        let geometry = ThreeRenderer.geometryCache.get(char);
        
        if (!geometry) {
          const shapes = font.generateShapes(char, fontSize);
          const extrudeSettings = {
            depth: activeAnim?.options.depth || 2,
            bevelEnabled: true,
            bevelThickness: activeAnim?.options.bevelThickness || 0.05,
            bevelSize: 0.05,
            bevelOffset: 0,
            bevelSegments: activeAnim?.options.bevelSegments || 3
          };
          geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
          geometry.computeBoundingBox();
          geometry.center();
          ThreeRenderer.geometryCache.set(char, geometry);
        }

        charMesh = new THREE.Mesh(geometry, material);

        if (geometry.boundingBox) {
          const size = new THREE.Vector3();
          geometry.boundingBox.getSize(size);
          charWidth = size.x;
          charHeight = size.y;
        }
        
        charGroup.add(charMesh);
      }

      charGroup.position.set(currentX + charWidth / 2, 0, 0);
      this.textGroup.add(charGroup);

      tempGlyphs.push({
        group: charGroup,
        mesh: charMesh,
        char,
        width: charWidth,
        height: charHeight,
        initialX: currentX + charWidth / 2
      });

      currentX += charWidth + spacing;
    }

    const totalWidth = currentX - spacing;
    for (const g of tempGlyphs) {
      g.group.position.x -= totalWidth / 2;
      g.initialX -= totalWidth / 2;
    }

    this.glyphs = tempGlyphs;
    this.isLoaded = true;
    
    // Apply styling container backgrounds
    if (style && style.background) {
      this.renderer.setClearColor(new THREE.Color(style.background), 1.0);
    } else {
      this.renderer.setClearColor(0x000000, 0.0);
    }

    if (style && style.glow && this.glowLight) {
      this.glowLight.color.set(style.glow.color);
      this.glowLight.intensity = style.glow.intensity * 2.0;
    } else if (this.glowLight) {
      this.glowLight.intensity = 0;
    }

    this.renderer.render(this.scene, this.camera);
  }

  render(states: GlyphState[]): number {
    const startTime = performance.now();
    if (!this.isLoaded) return 0;

    const activeAnim = Anomotion.activeInstance;
    
    // Camera orbit trigger
    if (activeAnim && activeAnim.options.effect === 'orbit3d') {
      const speed = activeAnim.options.orbitSpeed ?? 1.0;
      const dist = activeAnim.options.cameraDistance ?? 200;
      const angle = (performance.now() / 1000) * speed;
      this.camera.position.x = Math.sin(angle) * dist;
      this.camera.position.z = Math.cos(angle) * dist;
      this.camera.lookAt(0, 0, 0);
    } else {
      this.camera.position.set(0, 0, 200);
      this.camera.lookAt(0, 0, 0);
    }

    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const state = states[i];
      if (!state) continue;

      const group = glyph.group;
      const mesh = glyph.mesh;

      group.position.x = glyph.initialX + state.x;
      group.position.y = -state.y;
      group.position.z = state.z || 0;

      group.scale.set(
        state.scaleX,
        state.scaleY,
        state.scaleZ || 1.0
      );

      group.rotation.x = (state.rotation || 0) * Math.PI / 180;
      group.rotation.y = state.rotationY || 0;
      group.rotation.z = state.rotationZ || 0;

      if (mesh && mesh.material) {
        const mat = mesh.material;
        
        if (mat instanceof THREE.ShaderMaterial) {
          mat.uniforms.uOpacity.value = state.opacity;
        } else if (mat instanceof THREE.MeshStandardMaterial) {
          mat.opacity = state.opacity;
          if (state.color) {
            const hexStr = state.color.replace('#', '0x');
            const hex = parseInt(hexStr, 16);
            if (!isNaN(hex)) {
              mat.color.setHex(hex);
            }
          }
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
    return performance.now() - startTime;
  }

  resize(): void {
    const rect = this.container.getBoundingClientRect();
    this.camera.aspect = rect.width / (rect.height || 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  dispose(): void {
    this.isLoaded = false;
    
    // Dispose allocated textures
    for (const tex of this.activeTextures) {
      tex.dispose();
    }
    this.activeTextures = [];

    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.container.innerHTML = '';
  }
}

Anomotion.registerRenderer('three', ThreeRenderer);
export default ThreeRenderer;
