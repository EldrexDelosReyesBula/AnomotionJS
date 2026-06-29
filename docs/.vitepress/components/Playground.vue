<template>
  <div class="embedded-playground" :style="{ height: height }">
    <div class="playground-preview-container" ref="previewRef">
      <!-- Live text target -->
      <div class="preview-text">KINETIC GLYPH</div>
    </div>
    
    <div v-if="showCode === 'true' || showCode === true" class="playground-code-bar">
      <pre><code>{{ codeTemplate }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';

const props = defineProps({
  preset: {
    type: String,
    default: 'wave'
  },
  showCode: {
    type: [Boolean, String],
    default: 'true'
  },
  height: {
    type: String,
    default: '320px'
  },
  responsive: {
    type: [Boolean, String],
    default: 'true'
  }
});

const previewRef = ref(null);
let animInstance = null;

const codeTemplate = computed(() => {
  const is3d = props.preset.includes('3d') || props.preset.includes('orbit');
  return `Anomotion.create('#text', {
  text: 'KINETIC GLYPH',
  effect: '${props.preset}',
  renderer: '${is3d ? 'three' : 'dom'}',
  duration: 1.8,
  loop: true
});`;
});

onMounted(async () => {
  // Prevent SSR failures by dynamically importing browser libs
  const { Anomotion } = await import('@eldrex/anomotionjs-core');
  await import('@eldrex/anomotionjs-renderer-2d');
  await import('@eldrex/anomotionjs-renderer-3d');

  if (previewRef.value) {
    const is3d = props.preset.includes('3d') || props.preset.includes('orbit');
    animInstance = Anomotion.create(previewRef.value.querySelector('.preview-text') || previewRef.value, {
      text: 'KINETIC GLYPH',
      effect: props.preset,
      duration: 1.8,
      stagger: 50,
      renderer: is3d ? 'three' : 'dom',
      loop: true,
      textColor: '#f8fafc',
      style: {
        background: '#0a0a0f',
        textColor: '#f8fafc'
      }
    });
  }
});

onUnmounted(() => {
  if (animInstance) {
    animInstance.destroy();
  }
});
</script>

<style scoped>
.embedded-playground {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background-color: #0a0a0f;
  margin: 16px 0;
}

.playground-preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  min-height: 180px;
}

.preview-text {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 3rem;
  color: #f8fafc;
  text-align: center;
  user-select: none;
}

.playground-code-bar {
  background-color: #020204;
  border-top: 1px solid var(--vp-c-divider);
  padding: 12px 16px;
  font-family: monospace;
  font-size: 11px;
  color: #e2e8f0;
  overflow-x: auto;
}

.playground-code-bar pre {
  margin: 0;
  padding: 0;
  background: none;
}
</style>
