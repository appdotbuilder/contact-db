
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const contactsTable = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  phone_number: text('phone_number'), // Nullable by default
  email: text('email'), // Nullable by default
  address: text('address'), // Nullable by default
  company: text('company'), // Nullable by default
  notes: text('notes'), // Nullable by default
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Contact = typeof contactsTable.$inferSelect; // For SELECT operations
export type NewContact = typeof contactsTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { contacts: contactsTable };
