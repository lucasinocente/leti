<script setup lang="ts">
withDefaults(
  defineProps<{
    to: string
    title: string
    description?: string
    image?: string
    external?: boolean
  }>(),
  { description: undefined, image: undefined, external: false }
)
</script>

<template>
  <NuxtLink
    :to="to"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noopener' : undefined"
    class="flex flex-col w-full items-center gap-3 rounded-xl border border-purple-200 bg-white px-4 py-3 shadow-sm transition active:scale-[0.98]"
    @click="trackLinkClick(title, external ? 'external' : 'internal')"
  >
    <img
      v-if="image"
      :src="image"
      :alt="title"
      class="rounded-lg object-cover"
    >
    <div class="min-w-0" :class="image ? 'text-center' : ''">
      <p class="font-semibold" :class="external ? 'text-link' : 'text-purple-950'">
        {{ title }}
      </p>
      <p v-if="description" class="mt-0.5 text-sm text-purple-700">
        {{ description }}
      </p>
    </div>
  </NuxtLink>
</template>
