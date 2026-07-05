<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  url: string
}>()

function extractYoutubeId(url: string) {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/
  )
  return match?.[1] ?? ''
}

const videoId = computed(() => extractYoutubeId(props.url))
</script>

<template>
  <div class="w-full overflow-hidden rounded-xl border border-purple-200 bg-white shadow-sm">
    <div class="aspect-video w-full">
      <iframe
        class="h-full w-full"
        :src="`https://www.youtube.com/embed/${videoId}`"
        :title="title"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
    <div class="px-4 py-3">
      <p class="font-semibold text-purple-950">
        {{ title }}
      </p>
      <p v-if="description" class="mt-0.5 text-sm text-purple-700">
        {{ description }}
      </p>
    </div>
  </div>
</template>
