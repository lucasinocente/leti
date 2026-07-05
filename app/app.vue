<script setup lang="ts">
const { data: profile } = await useAsyncData('profile', () => queryCollection('profile').first())

useHead({
  title: () => profile.value ? `${profile.value.name} - ${profile.value.description}` : undefined,
  meta: [{ name: 'description', content: () => profile.value?.description }],
  link: [{ rel: 'icon', href: () => profile.value?.avatar }]
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
