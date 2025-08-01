
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type GetContactInput, type Contact } from '../schema';
import { eq } from 'drizzle-orm';

export const getContact = async (input: GetContactInput): Promise<Contact | null> => {
  try {
    const result = await db.select()
      .from(contactsTable)
      .where(eq(contactsTable.id, input.id))
      .execute();

    // Return the first result or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Contact retrieval failed:', error);
    throw error;
  }
};
