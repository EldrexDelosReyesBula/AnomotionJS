import { withMermaid } from 'vitepress-plugin-mermaid';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

export default withMermaid({
  title: 'AnomotionJS',
  description: 'High performance offline-first text animation engine',
  ignoreDeadLinks: true,
  sitemap: {
    hostname: 'https://anomotionjs.vercel.app'
  },
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'keywords', content: 'anomotionjs, text animation, animation engine, javascript animation, web animation, offline-first animation, performance, high performance' }],
    ['meta', { name: 'author', content: 'Eldrex Delos Reyes Bula' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'AnomotionJS - Text Animation Engine' }],
    ['meta', { property: 'og:description', content: 'High performance offline-first text animation engine.' }],
    ['meta', { property: 'og:url', content: 'https://anomotionjs.vercel.app/' }],
    ['meta', { property: 'og:image', content: 'https://anomotionjs.vercel.app/word-mark.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'AnomotionJS - Text Animation Engine' }],
    ['meta', { name: 'twitter:description', content: 'High performance offline-first text animation engine.' }],
    ['meta', { name: 'twitter:image', content: 'https://anomotionjs.vercel.app/word-mark.png' }]
  ],
  vite: {
    resolve: {
      alias: {
        'vue/server-renderer': path.resolve(path.dirname(require.resolve('vue')), 'server-renderer/index.mjs')
      }
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Presets', link: '/presets' },
      { text: 'API Reference', link: '/api/core' },
      { text: 'Playground', link: 'https://anomotionjs.vercel.app/playground/' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Presets Gallery', link: '/presets' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Quick Start', link: '/guide/quick-start' },
          { text: 'Core Concepts', link: '/guide/core-concepts' }
        ]
      },
      {
        text: 'Guides',
        items: [
          { text: 'Effects Catalog', link: '/guide/effects-catalog' },
          { text: 'Framework Integration', link: '/guide/frameworks' },
          { text: 'Physics Simulation', link: '/guide/physics' },
          { text: 'Renderers Comparison', link: '/guide/renderers' },
          { text: 'Offline & Caching', link: '/guide/offline-caching' },
          { text: 'Custom Plugins', link: '/guide/plugins' },
          { text: 'Migration Guide', link: '/guide/migration' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' }
        ]
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Core API', link: '/api/core' },
          { text: 'Text API', link: '/api/text' },
          { text: 'Renderer 2D API', link: '/api/renderer-2d' },
          { text: 'Renderer 3D API', link: '/api/renderer-3d' },
          { text: 'Physics API', link: '/api/physics' },
          { text: 'Plugins API', link: '/api/plugins-api' }
        ]
      },
      {
        text: 'Community & Learning',
        items: [
          { text: 'Showcase', link: '/community/showcase' },
          { text: 'Resources & Support', link: '/community/resources' },
          { text: 'Art: WebGL Performance', link: '/community/high-performance-text-webgl' },
          { text: 'Art: Verlet Physics', link: '/community/verlet-physics-web-animations' },
          { text: 'Contributing Guidelines', link: '/community/contributing' },
          { text: 'Code of Conduct', link: '/community/code-of-conduct' },
          { text: 'Security Policy', link: '/community/security' },
          { text: 'MIT License', link: '/community/license' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/EldrexDelosReyesBula/AnomotionJS' }
    ]
  }
});
