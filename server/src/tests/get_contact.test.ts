
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type GetContactInput } from '../schema';
import { getContact } from '../handlers/get_contact';

describe('getContact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a contact when found', async () => {
    // Create a test contact first
    const insertResult = await db.insert(contactsTable)
      .values({
        name: 'John Doe',
        phone_number: '+1-555-0123',
        email: 'john@example.com',
        address: '123 Main St',
        company: 'Acme Corp',
        notes: 'Test contact'
      })
      .returning()
      .execute();

    const createdContact = insertResult[0];
    const input: GetContactInput = { id: createdContact.id };

    const result = await getContact(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdContact.id);
    expect(result!.name).toEqual('John Doe');
    expect(result!.phone_number).toEqual('+1-555-0123');
    expect(result!.email).toEqual('john@example.com');
    expect(result!.address).toEqual('123 Main St');
    expect(result!.company).toEqual('Acme Corp');
    expect(result!.notes).toEqual('Test contact');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when contact not found', async () => {
    const input: GetContactInput = { id: 999 }; // Non-existent ID

    const result = await getContact(input);

    expect(result).toBeNull();
  });

  it('should handle contacts with nullable fields', async () => {
    // Create a minimal contact with only required fields
    const insertResult = await db.insert(contactsTable)
      .values({
        name: 'Jane Smith',
        phone_number: null,
        email: null,
        address: null,
        company: null,
        notes: null
      })
      .returning()
      .execute();

    const createdContact = insertResult[0];
    const input: GetContactInput = { id: createdContact.id };

    const result = await getContact(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdContact.id);
    expect(result!.name).toEqual('Jane Smith');
    expect(result!.phone_number).toBeNull();
    expect(result!.email).toBeNull();
    expect(result!.address).toBeNull();
    expect(result!.company).toBeNull();
    expect(result!.notes).toBeNull();
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });
});
