
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type CreateContactInput } from '../schema';
import { createContact } from '../handlers/create_contact';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateContactInput = {
  name: 'John Doe',
  phone_number: '+1-555-0123',
  email: 'john.doe@example.com',
  address: '123 Main St, Anytown, USA',
  company: 'Tech Corp',
  notes: 'Important client'
};

describe('createContact', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a contact with all fields', async () => {
    const result = await createContact(testInput);

    // Basic field validation
    expect(result.name).toEqual('John Doe');
    expect(result.phone_number).toEqual('+1-555-0123');
    expect(result.email).toEqual('john.doe@example.com');
    expect(result.address).toEqual('123 Main St, Anytown, USA');
    expect(result.company).toEqual('Tech Corp');
    expect(result.notes).toEqual('Important client');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a contact with minimal required fields', async () => {
    const minimalInput: CreateContactInput = {
      name: 'Jane Smith',
      phone_number: null,
      email: null,
      address: null,
      company: null,
      notes: null
    };

    const result = await createContact(minimalInput);

    expect(result.name).toEqual('Jane Smith');
    expect(result.phone_number).toBeNull();
    expect(result.email).toBeNull();
    expect(result.address).toBeNull();
    expect(result.company).toBeNull();
    expect(result.notes).toBeNull();
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should convert empty email string to null', async () => {
    const inputWithEmptyEmail: CreateContactInput = {
      name: 'Test User',
      phone_number: null,
      email: '',
      address: null,
      company: null,
      notes: null
    };

    const result = await createContact(inputWithEmptyEmail);

    expect(result.email).toBeNull();
  });

  it('should save contact to database', async () => {
    const result = await createContact(testInput);

    // Query using proper drizzle syntax
    const contacts = await db.select()
      .from(contactsTable)
      .where(eq(contactsTable.id, result.id))
      .execute();

    expect(contacts).toHaveLength(1);
    expect(contacts[0].name).toEqual('John Doe');
    expect(contacts[0].phone_number).toEqual('+1-555-0123');
    expect(contacts[0].email).toEqual('john.doe@example.com');
    expect(contacts[0].address).toEqual('123 Main St, Anytown, USA');
    expect(contacts[0].company).toEqual('Tech Corp');
    expect(contacts[0].notes).toEqual('Important client');
    expect(contacts[0].created_at).toBeInstanceOf(Date);
    expect(contacts[0].updated_at).toBeInstanceOf(Date);
  });

  it('should generate unique IDs for multiple contacts', async () => {
    const contact1 = await createContact({
      name: 'Contact One',
      phone_number: null,
      email: null,
      address: null,
      company: null,
      notes: null
    });

    const contact2 = await createContact({
      name: 'Contact Two',
      phone_number: null,
      email: null,
      address: null,
      company: null,
      notes: null
    });

    expect(contact1.id).not.toEqual(contact2.id);
    expect(contact1.id).toBeGreaterThan(0);
    expect(contact2.id).toBeGreaterThan(0);
  });
});
