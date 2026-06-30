import { z } from 'zod';

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1,   { message: 'Name is required' })
    .max(100, { message: 'Name must be 100 characters or fewer' }),

  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(254, { message: 'Email address is too long' }),

  message: z
    .string()
    .trim()
    .min(1,    { message: 'Message is required' })
    .max(2000, { message: 'Message must be 2000 characters or fewer' }),

  _hp: z.string().optional(),
});

export type ContactSchemaInput = z.infer<typeof contactSchema>;
