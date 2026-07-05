<script setup lang="ts">
definePageMeta({ layout: 'content' })

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('links').path(route.path).first()
)

if (!page.value || page.value.type !== 'internal') {
  throw createError({ statusCode: 404, statusMessage: 'Página não encontrada' })
}
</script>

<template>
  <article v-if="page" class="prose prose-sm max-w-none">
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
</template>
