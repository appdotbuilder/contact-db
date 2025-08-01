
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type UpdateContactInput, type Contact } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateContact(input: UpdateContactInput): Promise<Contact | null> {
  try {
    // Extract the ID and the fields to update
    const { id, ...updateFields } = input;

    // Remove undefined fields from the update object
    const fieldsToUpdate = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== undefined)
    );

    // If no fields to update, just return the existing contact
    if (Object.keys(fieldsToUpdate).length === 0) {
      const existingContact = await db.select()
        .from(contactsTable)
        .where(eq(contactsTable.id, id))
        .execute();

      return existingContact.length > 0 ? existingContact[0] : null;
    }

    // Add updated_at timestamp to the update
    const updateData = {
      ...fieldsToUpdate,
      updated_at: new Date()
    };

    // Update the contact and return the updated record
    const result = await db.update(contactsTable)
      .set(updateData)
      .where(eq(contactsTable.id, id))
      .returning()
      .execute();

    // Return the updated contact or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Contact update failed:', error);
    throw error;
  }
}
