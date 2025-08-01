
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type CreateContactInput, type UpdateContactInput } from '../schema';
import { updateContact } from '../handlers/update_contact';
import { eq } from 'drizzle-orm';

// Test data
const testContactInput: CreateContactInput = {
  name: 'John Doe',
  phone_number: '555-0123',
  email: 'john@example.com',
  address: '123 Main St',
  company: 'Test Corp',
  notes: 'Initial notes'
};

describe('updateContact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update a contact with all fields', async () => {
    // Create initial contact
    const created = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();
    
    const contactId = created[0].id;

    const updateInput: UpdateContactInput = {
      id: contactId,
      name: 'Jane Smith',
      phone_number: '555-9876',
      email: 'jane@example.com',
      address: '456 Oak Ave',
      company: 'New Corp',
      notes: 'Updated notes'
    };

    const result = await updateContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contactId);
    expect(result!.name).toEqual('Jane Smith');
    expect(result!.phone_number).toEqual('555-9876');
    expect(result!.email).toEqual('jane@example.com');
    expect(result!.address).toEqual('456 Oak Ave');
    expect(result!.company).toEqual('New Corp');
    expect(result!.notes).toEqual('Updated notes');
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(result!.created_at.getTime());
  });

  it('should update a contact with partial fields', async () => {
    // Create initial contact
    const created = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();
    
    const contactId = created[0].id;

    const updateInput: UpdateContactInput = {
      id: contactId,
      name: 'Updated Name',
      email: 'updated@example.com'
    };

    const result = await updateContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contactId);
    expect(result!.name).toEqual('Updated Name');
    expect(result!.phone_number).toEqual('555-0123'); // Unchanged
    expect(result!.email).toEqual('updated@example.com');
    expect(result!.address).toEqual('123 Main St'); // Unchanged
    expect(result!.company).toEqual('Test Corp'); // Unchanged
    expect(result!.notes).toEqual('Initial notes'); // Unchanged
  });

  it('should update contact in database', async () => {
    // Create initial contact
    const created = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();
    
    const contactId = created[0].id;

    const updateInput: UpdateContactInput = {
      id: contactId,
      name: 'Database Updated Name'
    };

    await updateContact(updateInput);

    // Verify the change was persisted
    const contacts = await db.select()
      .from(contactsTable)
      .where(eq(contactsTable.id, contactId))
      .execute();

    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toEqual('Database Updated Name');
    expect(contacts[0].phone_number).toEqual('555-0123'); // Unchanged
  });

  it('should set nullable fields to null', async () => {
    // Create initial contact
    const created = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();
    
    const contactId = created[0].id;

    const updateInput: UpdateContactInput = {
      id: contactId,
      phone_number: null,
      email: null,
      notes: null
    };

    const result = await updateContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.phone_number).toBeNull();
    expect(result!.email).toBeNull();
    expect(result!.notes).toBeNull();
    expect(result!.name).toEqual('John Doe'); // Unchanged
  });

  it('should return null for non-existent contact', async () => {
    const updateInput: UpdateContactInput = {
      id: 999999,
      name: 'Non-existent'
    };

    const result = await updateContact(updateInput);

    expect(result).toBeNull();
  });

  it('should handle empty update (no fields to update)', async () => {
    // Create initial contact
    const created = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();
    
    const contactId = created[0].id;

    const updateInput: UpdateContactInput = {
      id: contactId
    };

    const result = await updateContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contactId);
    expect(result!.name).toEqual('John Doe');
    expect(result!.phone_number).toEqual('555-0123');
    expect(result!.email).toEqual('john@example.com');
  });

  it('should update email with empty string', async () => {
    // Create initial contact
    const created = await db.insert(contactsTable)
      .values(testContactInput)
      .returning()
      .execute();
    
    const contactId = created[0].id;

    const updateInput: UpdateContactInput = {
      id: contactId,
      email: ""
    };

    const result = await updateContact(updateInput);

    expect(result).not.toBeNull();
    expect(result!.email).toEqual("");
    expect(result!.name).toEqual('John Doe'); // Unchanged
  });
});
