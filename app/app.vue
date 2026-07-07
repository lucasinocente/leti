<script setup lang="ts">
const { data: profile } = await useAsyncData('profile', () => queryCollection('profile').first())

useHead({
  title: () => profile.value ? `${profile.value.name} - ${profile.value.description}` : undefined,
  meta: [{ name: 'description', content: () => profile.value?.description }],
  link: [{ rel: 'icon', href: () => profile.value?.avatar }],
  script: import.meta.dev ? [] : [
    { src: 'https://www.googletagmanager.com/gtag/js?id=G-86ZLZJRZ9L', async: true },
    {
      innerHTML: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-86ZLZJRZ9L');
      `
    }
  ]
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
