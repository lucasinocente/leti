<template>
  <div class="min-h-screen bg-purple-50">
    <div class="mx-auto max-w-md px-4 py-6">
      <NuxtLink
        to="/"
        class="mb-4 inline-flex items-center gap-1 text-sm font-medium text-purple-700"
      >
        <span aria-hidden="true">←</span> Voltar
      </NuxtLink>
      <slot />
      <Footer />
    </div>
  </div>
</template>
