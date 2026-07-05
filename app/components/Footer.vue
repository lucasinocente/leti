<script setup lang="ts">
const { data: profile } = await useAsyncData('profile', () => queryCollection('profile').first())
</script>

<template>
  <footer v-if="profile" class="mt-10 flex items-center justify-between gap-2 text-cente border-t border-purple-200 pt-4">
    <p class="text-sm font-bold text-purple-500">
      {{ profile.name }}
    </p>
    <SocialLinks :socials="profile.socials" size="sm" />
  </footer>
</template>
