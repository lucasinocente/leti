<script setup lang="ts">
definePageMeta({ layout: 'content' })

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('links').path(route.path).first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Página não encontrada' })
}

if (page.value.type === 'external') {
  await navigateTo(page.value.url, { external: true, redirectCode: 302 })
}
</script>

<template>
  <article v-if="page?.type === 'internal'" class="prose prose-sm max-w-none">
    <img
      v-if="page.image"
      :src="page.image"
      :alt="page.title"
      class="w-full rounded-xl object-cover"
    >
    <h1>{{ page.title }}</h1>
    <p>{{ page.description }}</p>
    <ContentRenderer :value="page" />
  </article>

  <VideoEmbed
    v-else-if="page?.type === 'video'"
    :title="page.title"
    :description="page.description"
    :url="page.url ?? ''"
  />

  <MapEmbed
    v-else-if="page?.type === 'maps'"
    :title="page.title"
    :description="page.description"
    :address="page.address ?? ''"
  />
</template>
