import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/content'],
  css: ['~/assets/css/main.css'],
  routeRules: {
    '/timer': { ssr: false }
  },
  spaLoadingTemplate: 'app/spa-loading-template.html',
  app: {
    head: {
      script: [
        {
          innerHTML: `
            if (location.pathname === '/timer') {
              var beltColors = { white: '#ffffff', blue: '#002438', purple: '#261029', brown: '#26170a', black: '#09090b' }
              var mode = 'purple'
              try {
                var saved = JSON.parse(localStorage.getItem('bjj-timer-settings') || '{}')
                if (saved && beltColors[saved.colorMode]) mode = saved.colorMode
              } catch (e) {}

              document.documentElement.style.backgroundColor = beltColors[mode]

              var blockBg = mode === 'white' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'
              var b = '<div style="height:56px;border-radius:12px;background:' + blockBg + ';animation:bjj-pulse 1.5s ease-in-out infinite"></div>'
              var row = '<div style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:16px">' + b + b + '</div>'

              document.write(
                '<div id="bjj-preload-skeleton" style="position:fixed;inset:0;z-index:9999;display:flex;justify-content:center;background:' + beltColors[mode] + '">' +
                  '<div style="width:100%;max-width:384px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:40px 24px;box-sizing:border-box">' +
                    '<div style="width:100%;display:flex;align-items:center;justify-content:space-between">' +
                      '<div style="width:160px;height:32px;border-radius:8px;background:' + blockBg + ';animation:bjj-pulse 1.5s ease-in-out infinite"></div>' +
                      '<div style="width:40px;height:40px;border-radius:12px;background:' + blockBg + ';animation:bjj-pulse 1.5s ease-in-out infinite"></div>' +
                    '</div>' +
                    '<div style="width:100%;display:flex;flex-direction:column;align-items:center;gap:24px">' +
                      row +
                      '<div style="width:100%;height:112px;border-radius:12px;background:' + blockBg + ';animation:bjj-pulse 1.5s ease-in-out infinite"></div>' +
                      row +
                    '</div>' +
                    '<div style="width:100%;height:64px;border-radius:12px;background:' + blockBg + ';animation:bjj-pulse 1.5s ease-in-out infinite"></div>' +
                  '</div>' +
                '</div>' +
                '<style>@keyframes bjj-pulse{0%,100%{opacity:1}50%{opacity:.5}}</style>'
              )
            }
          `
        }
      ]
    }
  },
  vite: {
    plugins: [tailwindcss()]
  }
})
