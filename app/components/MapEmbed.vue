<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  address: string
  to?: string
}>()

const mapSrc = computed(
  () => `https://www.google.com/maps?q=${encodeURIComponent(props.address)}&output=embed`
)
</script>

<template>
  <div class="w-full overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm">
    <div class="aspect-video w-full">
      <iframe
        class="h-full w-full"
        :src="mapSrc"
        :title="title"
        frameborder="0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      />
    </div>
    <div class="px-4 py-3">
      <NuxtLink v-if="to" :to="to" class="font-semibold text-purple-950">
        {{ title }}
      </NuxtLink>
      <p v-else class="font-semibold text-purple-950">
        {{ title }}
      </p>
      <p v-if="description" class="mt-0.5 text-sm text-purple-700">
        {{ description }}
      </p>
      <p class="mt-0.5 text-sm text-purple-500">
        {{ address }}
      </p>
    </div>
  </div>
</template>
