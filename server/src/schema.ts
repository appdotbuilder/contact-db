
import { z } from 'zod';

// Contact schema
export const contactSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone_number: z.string().nullable(),
  email: z.string().nullable(),
  address: z.string().nullable(),
  company: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Contact = z.infer<typeof contactSchema>;

// Input schema for creating contacts
export const createContactInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: z.string().nullable(),
  email: z.string().email().nullable().or(z.literal("")),
  address: z.string().nullable(),
  company: z.string().nullable(),
  notes: z.string().nullable()
});

export type CreateContactInput = z.infer<typeof createContactInputSchema>;

// Input schema for updating contacts
export const updateContactInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").optional(),
  phone_number: z.string().nullable().optional(),
  email: z.string().email().nullable().or(z.literal("")).optional(),
  address: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  notes: z.string().nullable().optional()
});

export type UpdateContactInput = z.infer<typeof updateContactInputSchema>;

// Input schema for getting a single contact
export const getContactInputSchema = z.object({
  id: z.number()
});

export type GetContactInput = z.infer<typeof getContactInputSchema>;

// Input schema for deleting a contact
export const deleteContactInputSchema = z.object({
  id: z.number()
});

export type DeleteContactInput = z.infer<typeof deleteContactInputSchema>;
