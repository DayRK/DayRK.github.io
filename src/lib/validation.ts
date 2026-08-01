import { z } from 'zod';

export const ProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less')
    .trim(),
  summary: z
    .string()
    .min(10, 'Summary must be at least 10 characters')
    .max(1000, 'Summary must be 1000 characters or less')
    .trim(),
  link: z
    .string()
    .url('Link must be a valid URL')
    .max(500, 'Link must be 500 characters or less'),
  stack: z
    .array(z.string().max(100))
    .min(1, 'At least one technology is required')
    .max(20, 'Maximum 20 technologies allowed'),
  showPreview: z.boolean().optional().default(true),
});

export const AvailabilitySchema = z.object({
  status: z.enum([
    'Open to Commissions',
    'Limited Availability',
    'Closed for Commissions',
  ]),
});

export const AdminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
export type AvailabilityInput = z.infer<typeof AvailabilitySchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
