<script setup lang="ts">
defineProps<{
  name: string
  description: string
  avatar: string
}>()
</script>

<template>
  <div class="mb-8 flex flex-col items-center text-center">
    <img
      :src="avatar"
      :alt="name"
      class="h-24 w-24 rounded-full border-4 border-purple-500 object-cover"
    >
    <h1 class="mt-4 text-xl font-bold text-purple-950">
      {{ name }}
    </h1>
    <p class="mt-1 text-sm text-purple-800">
      {{ description }}
    </p>
  </div>
</template>
