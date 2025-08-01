
import { db } from '../db';
import { contactsTable } from '../db/schema';
import { type Contact } from '../schema';
import { asc } from 'drizzle-orm';

export const getContacts = async (): Promise<Contact[]> => {
  try {
    const results = await db.select()
      .from(contactsTable)
      .orderBy(asc(contactsTable.name))
      .execute();

    return results;
  } catch (error) {
    console.error('Getting contacts failed:', error);
    throw error;
  }
};
