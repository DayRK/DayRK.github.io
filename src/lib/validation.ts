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

export const ExperienceSchema = z.object({
  role: z.string().min(1, 'Role is required').max(255, 'Role must be 255 characters or less').trim(),
  company: z.string().min(1, 'Company is required').max(255, 'Company must be 255 characters or less').trim(),
  period: z.string().min(1, 'Period is required').max(100, 'Period must be 100 characters or less').trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be 1000 characters or less')
    .trim(),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0),
});

export const CertificateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less').trim(),
  issuer: z.string().min(1, 'Issuer is required').max(255, 'Issuer must be 255 characters or less').trim(),
  issuedAt: z.string().min(1, 'Date is required').max(100, 'Date must be 100 characters or less').trim(),
  link: z
    .union([z.string().url('Link must be a valid URL').max(500, 'Link must be 500 characters or less'), z.literal('')])
    .optional()
    .default(''),
  sortOrder: z.number().int().min(0).max(9999).optional().default(0),
});

export const PostSchema = z.object({
  slug: z.string().max(150, 'Slug must be 150 characters or less').trim().optional().default(''),
  title: z.string().min(1, 'Title is required').max(255, 'Title must be 255 characters or less').trim(),
  excerpt: z
    .string()
    .min(10, 'Excerpt must be at least 10 characters')
    .max(500, 'Excerpt must be 500 characters or less')
    .trim(),
  content: z
    .string()
    .min(20, 'Content must be at least 20 characters')
    .max(50000, 'Content must be 50000 characters or less')
    .trim(),
  kind: z.enum(['blog', 'research']).optional().default('blog'),
  tags: z.array(z.string().max(50)).max(12, 'Maximum 12 tags allowed').optional().default([]),
  published: z.boolean().optional().default(false),
});

export const MediaMetaSchema = z.object({
  alt: z
    .string()
    .max(200, 'Alt text must be 200 characters or less')
    .trim()
    .optional()
    .default(''),
});

export const ContactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  email: z
    .string()
    .email('A valid email is required')
    .max(200, 'Email must be 200 characters or less')
    .trim(),
  subject: z
    .string()
    .max(150, 'Subject must be 150 characters or less')
    .trim()
    .optional()
    .default(''),
  budget: z
    .string()
    .max(50, 'Budget must be 50 characters or less')
    .trim()
    .optional()
    .default(''),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(3000, 'Message must be 3000 characters or less')
    .trim(),
  // Honeypot field. Real visitors never see it, bots fill it in.
  website: z.string().max(200).optional().default(''),
});

export const ModuleVisibilitySchema = z.object({
  module: z.enum([
    'about',
    'projects',
    'experience',
    'certificates',
    'github',
    'contact',
    'blog',
    'resume',
    'search',
  ]),
  visible: z.boolean(),
});

export const SearchQuerySchema = z.object({
  q: z
    .string()
    .max(100, 'Search must be 100 characters or less')
    .trim(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
export type AvailabilityInput = z.infer<typeof AvailabilitySchema>;
export type AdminLoginInput = z.infer<typeof AdminLoginSchema>;
