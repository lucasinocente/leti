<script setup lang="ts">
const { data: profile } = await useAsyncData('profile', () =>
  queryCollection('profile').first()
)

const { data: links } = await useAsyncData('links', () =>
  queryCollection('links').order('order', 'ASC').all()
)

const visibleLinks = computed(() => links.value?.filter((link) => !link.hide) ?? [])
</script>

<template>
  <div>
    <ProfileHeader
      v-if="profile"
      :name="profile.name"
      :description="profile.description"
      :avatar="profile.avatar"
    />

    <!-- <SocialLinks v-if="profile" :socials="profile.socials" /> -->

    <div class="flex flex-col gap-3">
      <template v-for="link in visibleLinks" :key="link.path">
        <VideoEmbed
          v-if="link.type === 'video'"
          :title="link.title"
          :description="link.description"
          :url="link.url ?? ''"
        />
        <MapEmbed
          v-else-if="link.type === 'maps'"
          :title="link.title"
          :description="link.description"
          :address="link.address ?? ''"
        />
        <LinkCard
          v-else-if="link.type === 'external'"
          :to="link.url ?? '#'"
          :title="link.title"
          :description="link.description"
          :image="link.image"
          external
        />
        <LinkCard
          v-else
          :to="link.path"
          :title="link.title"
          :description="link.description"
          :image="link.image"
        />
      </template>
    </div>
  </div>
</template>
