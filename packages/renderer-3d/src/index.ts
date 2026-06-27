import { Renderer, GlyphState, Anomotion } from '@eldrex/anomotionjs-core';
import * as THREE from 'three';
// @ts-ignore
import { Text } from 'troika-three-text';

export class ThreeRenderer implements Renderer {
  public container: HTMLElement;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public glyphs: any[] = [];
  private textMesh: any;

  constructor(container: HTMLElement) {
    this.container = container;
    this.initThree();
  }

  private initThree() {
    const rect = this.container.getBoundingClientRect();
    
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 1000);
    this.camera.position.z = 200;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(rect.width, rect.height);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    
    this.container.appendChild(this.renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Add directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 50, 100);
    this.scene.add(dirLight);
  }

  mount(text: string): void {
    // Clean up previous meshes
    if (this.textMesh) {
      this.scene.remove(this.textMesh);
      this.textMesh.dispose();
    }

    this.textMesh = new Text();
    this.textMesh.text = text;
    this.textMesh.fontSize = 24;
    this.textMesh.color = 0xf3f4f6;
    this.textMesh.anchorX = 'center';
    this.textMesh.anchorY = 'middle';

    // Populate glyphs synchronously so TextAnimation can initialize states
    this.glyphs = Array.from({ length: text.length }, (_, idx) => ({
      index: idx,
      char: text[idx]
    }));

    this.scene.add(this.textMesh);

    this.textMesh.sync(() => {
      this.renderer.render(this.scene, this.camera);
    });
  }

  render(states: GlyphState[]): number {
    const startTime = performance.now();
    
    if (this.textMesh && states[0]) {
      const avgState = states.reduce((acc, curr) => {
        acc.x += curr.x;
        acc.y += curr.y;
        acc.rotation += curr.rotation;
        return acc;
      }, { x: 0, y: 0, rotation: 0 });

      const len = states.length || 1;
      this.textMesh.position.x = avgState.x / len;
      this.textMesh.position.y = -(avgState.y / len); // Invert Y for 3D coordinates space
      this.textMesh.rotation.z = (avgState.rotation / len) * Math.PI / 180;

      // Update text color dynamically from state
      if (states[0].color) {
        const hexStr = states[0].color.replace('#', '0x');
        const hex = parseInt(hexStr, 16);
        if (!isNaN(hex)) {
          this.textMesh.color = hex;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
    return performance.now() - startTime;
  }

  resize(): void {
    const rect = this.container.getBoundingClientRect();
    this.camera.aspect = rect.width / rect.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(rect.width, rect.height);
  }

  dispose(): void {
    if (this.textMesh) {
      this.scene.remove(this.textMesh);
      this.textMesh.dispose();
    }
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.container.innerHTML = '';
  }
}

// Register renderer
Anomotion.registerRenderer('three', ThreeRenderer);
