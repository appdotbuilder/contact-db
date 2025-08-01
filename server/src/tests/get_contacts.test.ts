
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type CreateContactInput } from '../schema';
import { getContacts } from '../handlers/get_contacts';

// Test contact data
const testContact1: CreateContactInput = {
  name: 'Alice Johnson',
  phone_number: '555-0101',
  email: 'alice@example.com',
  address: '123 Main St',
  company: 'Tech Corp',
  notes: 'Important client'
};

const testContact2: CreateContactInput = {
  name: 'Bob Smith',
  phone_number: '555-0102',
  email: 'bob@example.com',
  address: '456 Oak Ave',
  company: 'Design LLC',
  notes: 'Freelancer'
};

const testContact3: CreateContactInput = {
  name: 'Charlie Brown',
  phone_number: null,
  email: null,
  address: null,
  company: null,
  notes: null
};

describe('getContacts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no contacts exist', async () => {
    const result = await getContacts();

    expect(result).toEqual([]);
  });

  it('should return all contacts ordered by name', async () => {
    // Create test contacts in non-alphabetical order
    await db.insert(contactsTable).values([
      testContact2, // Bob
      testContact1, // Alice
      testContact3  // Charlie
    ]).execute();

    const result = await getContacts();

    expect(result).toHaveLength(3);
    
    // Should be ordered by name alphabetically
    expect(result[0].name).toEqual('Alice Johnson');
    expect(result[1].name).toEqual('Bob Smith');
    expect(result[2].name).toEqual('Charlie Brown');

    // Verify all fields are present
    expect(result[0].phone_number).toEqual('555-0101');
    expect(result[0].email).toEqual('alice@example.com');
    expect(result[0].address).toEqual('123 Main St');
    expect(result[0].company).toEqual('Tech Corp');
    expect(result[0].notes).toEqual('Important client');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle contacts with null values', async () => {
    await db.insert(contactsTable).values(testContact3).execute();

    const result = await getContacts();

    expect(result).toHaveLength(1);
    expect(result[0].name).toEqual('Charlie Brown');
    expect(result[0].phone_number).toBeNull();
    expect(result[0].email).toBeNull();
    expect(result[0].address).toBeNull();
    expect(result[0].company).toBeNull();
    expect(result[0].notes).toBeNull();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return contacts with proper timestamps', async () => {
    await db.insert(contactsTable).values(testContact1).execute();

    const result = await getContacts();

    expect(result).toHaveLength(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    
    // Timestamps should be recent (within last minute)
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    expect(result[0].created_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
    expect(result[0].updated_at.getTime()).toBeGreaterThan(oneMinuteAgo.getTime());
  });
});
