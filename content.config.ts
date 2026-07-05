import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    profile: defineCollection({
      type: 'data',
      source: 'profile.md',
      schema: z.object({
        name: z.string(),
        description: z.string(),
        avatar: z.string(),
        socials: z
          .array(
            z.object({
              platform: z.enum(['instagram', 'youtube', 'tiktok', 'facebook']),
              url: z.string()
            })
          )
          .default([])
      })
    }),
    links: defineCollection({
      type: 'page',
      source: 'links/**/*.md',
      schema: z.object({
        type: z.enum(['video', 'internal', 'external', 'maps']),
        title: z.string(),
        order: z.number(),
        description: z.string().optional(),
        url: z.string().optional(),
        address: z.string().optional(),
        image: z.string().optional(),
        hide: z.boolean().default(false)
      })
    })
  }
})
