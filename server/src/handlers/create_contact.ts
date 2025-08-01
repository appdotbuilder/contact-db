
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type CreateContactInput, type Contact } from '../schema';

export const createContact = async (input: CreateContactInput): Promise<Contact> => {
  try {
    // Insert contact record
    const result = await db.insert(contactsTable)
      .values({
        name: input.name,
        phone_number: input.phone_number,
        email: input.email === "" ? null : input.email, // Convert empty string to null
        address: input.address,
        company: input.company,
        notes: input.notes
      })
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Contact creation failed:', error);
    throw error;
  }
};
