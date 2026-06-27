import { Renderer, GlyphState, Anomotion } from '@eldrex/anomotionjs-core';
import { Canvas2DRenderer } from '@eldrex/anomotionjs-renderer-2d';

export class WebGPURenderer implements Renderer {
  public container: HTMLElement;
  public glyphs: any[] = [];
  private canvas: HTMLCanvasElement;
  private fallbackRenderer: Canvas2DRenderer | null = null;

  private device: any = null;
  private context: any = null;
  private pipeline: any = null;
  private sampler: any = null;

  private glyphResources: {
    texture: any;
    bindGroup: any;
    uniformBuffer: any;
    width: number;
    height: number;
  }[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.container.appendChild(this.canvas);

    if (!(navigator as any).gpu) {
      console.warn('WebGPURenderer: WebGPU not supported on this platform. Falling back to Canvas 2D mode.');
      this.canvas.remove();
      this.fallbackRenderer = new Canvas2DRenderer(container);
      return;
    }

    this.initGPU();
  }

  private async initGPU() {
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) {
        this.fallbackToCanvas();
        return;
      }
      this.device = await adapter.requestDevice();
      this.context = this.canvas.getContext('webgpu');

      const format = (navigator as any).gpu.getPreferredCanvasFormat();
      this.context.configure({
        device: this.device,
        format: format,
        alphaMode: 'premultiplied'
      });

      this.initPipeline(format);
    } catch (e) {
      console.error('WebGPURenderer: Failed to initialize WebGPU:', e);
      this.fallbackToCanvas();
    }
  }

  private fallbackToCanvas() {
    if (this.fallbackRenderer) return;
    console.warn('WebGPURenderer: Falling back to Canvas 2D.');
    this.canvas.remove();
    this.fallbackRenderer = new Canvas2DRenderer(this.container);
    if (this.glyphs.length > 0) {
      this.fallbackRenderer.mount(this.glyphs.map(g => g.char).join(''));
    }
  }

  private initPipeline(format: string) {
    const shaderModule = this.device.createShaderModule({
      code: `
        struct Uniforms {
          transform: mat4x4<f32>,
          opacity: f32,
          padding1: f32,
          padding2: f32,
          padding3: f32,
        };

        @group(0) @binding(0) var<uniform> uniforms: Uniforms;
        @group(0) @binding(1) var mySampler: sampler;
        @group(0) @binding(2) var myTexture: texture_2d<f32>;

        struct VertexOutput {
          @builtin(position) Position: vec4<f32>,
          @location(0) FragUV: vec2<f32>,
        };

        @vertex
        fn vs_main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {
          var pos = array<vec2<f32>, 6>(
            vec2<f32>(-0.5, -0.5),
            vec2<f32>( 0.5, -0.5),
            vec2<f32>(-0.5,  0.5),
            vec2<f32>(-0.5,  0.5),
            vec2<f32>( 0.5, -0.5),
            vec2<f32>( 0.5,  0.5)
          );

          var uv = array<vec2<f32>, 6>(
            vec2<f32>(0.0, 1.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(0.0, 0.0),
            vec2<f32>(0.0, 0.0),
            vec2<f32>(1.0, 1.0),
            vec2<f32>(1.0, 0.0)
          );

          var output: VertexOutput;
          output.Position = uniforms.transform * vec4<f32>(pos[VertexIndex], 0.0, 1.0);
          output.FragUV = uv[VertexIndex];
          return output;
        }

        @fragment
        fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
          var color = textureSample(myTexture, mySampler, input.FragUV);
          return vec4<f32>(color.rgb, color.a * uniforms.opacity);
        }
      `
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'vs_main'
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'fs_main',
        targets: [{
          format: format,
          blend: {
            color: {
              srcFactor: 'src-alpha',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add'
            },
            alpha: {
              srcFactor: 'one',
              dstFactor: 'one-minus-src-alpha',
              operation: 'add'
            }
          }
        }]
      },
      primitive: {
        topology: 'triangle-list'
      }
    });

    this.sampler = this.device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear'
    });
  }

  mount(text: string): void {
    if (this.fallbackRenderer) {
      this.fallbackRenderer.mount(text);
      this.glyphs = this.fallbackRenderer.glyphs;
      return;
    }

    this.glyphs = text.split('').map((char, index) => ({ char, index }));
    this.resize();

    if (this.device) {
      this.createGlyphResources(text);
    }
  }

  private createGlyphResources(text: string) {
    for (const res of this.glyphResources) {
      res.texture.destroy();
    }
    this.glyphResources = [];

    const font = '800 64px "Outfit", sans-serif';
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      ctx.font = font;
      const metrics = ctx.measureText(char);
      const width = Math.max(8, Math.ceil(metrics.width));
      const height = 80;

      canvas.width = width;
      canvas.height = height;

      ctx.font = font;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.clearRect(0, 0, width, height);
      ctx.fillText(char, width / 2, height / 2);

      const texture = this.device.createTexture({
        size: [width, height, 1],
        format: 'rgba8unorm',
        usage: 4 | 8 | 16 // TEXTURE_BINDING | COPY_DST | RENDER_ATTACHMENT
      });

      const imageBitmap = (canvas as any).transferToImageBitmap ? (canvas as any).transferToImageBitmap() : null;
      if (imageBitmap) {
        this.device.queue.copyExternalImageToTexture(
          { source: imageBitmap },
          { texture: texture },
          [width, height]
        );
      } else {
        const imageData = ctx.getImageData(0, 0, width, height);
        this.device.queue.writeTexture(
          { texture: texture },
          imageData.data,
          { bytesPerRow: width * 4 },
          [width, height]
        );
      }

      const uniformBuffer = this.device.createBuffer({
        size: 80,
        usage: 64 | 8 // UNIFORM | COPY_DST
      });

      const bindGroup = this.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: uniformBuffer } },
          { binding: 1, resource: this.sampler },
          { binding: 2, resource: texture.createView() }
        ]
      });

      this.glyphResources.push({
        texture,
        bindGroup,
        uniformBuffer,
        width,
        height
      });
    }
  }

  render(states: GlyphState[]): number {
    const startTime = performance.now();
    if (this.fallbackRenderer) {
      return this.fallbackRenderer.render(states);
    }

    if (!this.device || !this.context || !this.pipeline || this.glyphResources.length === 0) {
      return 0;
    }

    if (this.glyphResources.length !== this.glyphs.length) {
      this.createGlyphResources(this.glyphs.map(g => g.char).join(''));
      return 0;
    }

    const rect = this.container.getBoundingClientRect();

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.context.getCurrentTexture().createView();

    const renderPassDescriptor = {
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
        loadOp: 'clear',
        storeOp: 'store'
      }]
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(this.pipeline);

    let totalTextWidth = 0;
    for (const res of this.glyphResources) {
      totalTextWidth += res.width;
    }
    let currentX = (rect.width - totalTextWidth) / 2;
    const centerY = rect.height / 2;

    for (let i = 0; i < this.glyphResources.length; i++) {
      const res = this.glyphResources[i];
      const state = states[i];
      if (!state) continue;

      const x = currentX + res.width / 2 + state.x;
      const y = centerY + state.y;

      const screenX = (x / rect.width) * 2 - 1;
      const screenY = -((y / rect.height) * 2 - 1);
      const scaleX = (res.width / rect.width) * (state.scaleX || 1.0);
      const scaleY = (res.height / rect.height) * (state.scaleY || 1.0);

      const rad = (state.rotation || 0) * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const matrix = new Float32Array(16);
      matrix[0] = cos * scaleX;   matrix[4] = -sin * scaleY;  matrix[8] = 0;  matrix[12] = screenX;
      matrix[1] = sin * scaleX;   matrix[5] = cos * scaleY;   matrix[9] = 0;  matrix[13] = screenY;
      matrix[2] = 0;              matrix[6] = 0;              matrix[10] = 1; matrix[14] = 0;
      matrix[3] = 0;              matrix[7] = 0;              matrix[11] = 0; matrix[15] = 1;

      this.device.queue.writeBuffer(res.uniformBuffer, 0, matrix);
      this.device.queue.writeBuffer(res.uniformBuffer, 64, new Float32Array([state.opacity ?? 1.0]));

      passEncoder.setBindGroup(0, res.bindGroup);
      passEncoder.draw(6);

      currentX += res.width;
    }

    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);

    return performance.now() - startTime;
  }

  resize(): void {
    if (this.fallbackRenderer) {
      this.fallbackRenderer.resize();
      return;
    }
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
  }

  dispose(): void {
    if (this.fallbackRenderer) {
      this.fallbackRenderer.dispose();
      return;
    }
    for (const res of this.glyphResources) {
      res.texture.destroy();
    }
    this.canvas.remove();
    this.container.innerHTML = '';
  }
}

Anomotion.registerRenderer('webgpu', WebGPURenderer);
