
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type DeleteContactInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deleteContact = async (input: DeleteContactInput): Promise<{ success: boolean }> => {
  try {
    // Delete the contact by ID
    const result = await db.delete(contactsTable)
      .where(eq(contactsTable.id, input.id))
      .execute();

    // Check if any rows were affected (contact existed and was deleted)
    return { success: (result.rowCount ?? 0) > 0 };
  } catch (error) {
    console.error('Contact deletion failed:', error);
    throw error;
  }
};
