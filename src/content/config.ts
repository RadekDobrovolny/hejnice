import { defineCollection, z } from 'astro:content';

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    date: z.string(),
    time: z.string(),
    location: z.string(),
    theme: z.enum(['winter', 'late-summer']).default('winter'),
    contact: z.object({
      email: z.string(),
      phone: z.string(),
    }).optional(),
  }),
});

export const collections = { events };
