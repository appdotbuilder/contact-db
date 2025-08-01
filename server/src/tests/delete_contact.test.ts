
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type DeleteContactInput, type CreateContactInput } from '../schema';
import { deleteContact } from '../handlers/delete_contact';
import { eq } from 'drizzle-orm';

// Test input for creating a contact
const testContactInput: CreateContactInput = {
  name: 'John Doe',
  phone_number: '+1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  company: 'Test Company',
  notes: 'Test notes'
};

describe('deleteContact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing contact', async () => {
    // Create a test contact first
    const createResult = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();

    const contactId = createResult[0].id;
    const deleteInput: DeleteContactInput = { id: contactId };

    // Delete the contact
    const result = await deleteContact(deleteInput);

    // Should return success
    expect(result.success).toBe(true);

    // Verify contact was actually deleted from database
    const contacts = await db.select()
      .from(contactsTable)
      .where(eq(contactsTable.id, contactId))
      .execute();

    expect(contacts).toHaveLength(0);
  });

  it('should return false for non-existent contact', async () => {
    const deleteInput: DeleteContactInput = { id: 999 };

    // Try to delete non-existent contact
    const result = await deleteContact(deleteInput);

    // Should return failure
    expect(result.success).toBe(false);
  });

  it('should not affect other contacts when deleting one', async () => {
    // Create two test contacts
    const contact1Result = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();

    const contact2Result = await db.insert(contactsTable)
      .values({
        ...testContactInput,
        name: 'Jane Doe',
        email: 'jane@example.com'
      })
      .returning()
      .execute();

    const contact1Id = contact1Result[0].id;
    const contact2Id = contact2Result[0].id;

    // Delete only the first contact
    const deleteInput: DeleteContactInput = { id: contact1Id };
    const result = await deleteContact(deleteInput);

    // Should return success
    expect(result.success).toBe(true);

    // Verify first contact was deleted
    const deletedContacts = await db.select()
      .from(contactsTable)
      .where(eq(contactsTable.id, contact1Id))
      .execute();

    expect(deletedContacts).toHaveLength(0);

    // Verify second contact still exists
    const remainingContacts = await db.select()
      .from(contactsTable)
      .where(eq(contactsTable.id, contact2Id))
      .execute();

    expect(remainingContacts).toHaveLength(1);
    expect(remainingContacts[0].name).toEqual('Jane Doe');
  });
});
