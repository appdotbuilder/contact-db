
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createContactInputSchema, 
  updateContactInputSchema, 
  getContactInputSchema, 
  deleteContactInputSchema 
} from './schema';

// Import handlers
import { createContact } from './handlers/create_contact';
import { getContacts } from './handlers/get_contacts';
import { getContact } from './handlers/get_contact';
import { updateContact } from './handlers/update_contact';
import { deleteContact } from './handlers/delete_contact';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Contact CRUD operations
  createContact: publicProcedure
    .input(createContactInputSchema)
    .mutation(({ input }) => createContact(input)),
    
  getContacts: publicProcedure
    .query(() => getContacts()),
    
  getContact: publicProcedure
    .input(getContactInputSchema)
    .query(({ input }) => getContact(input)),
    
  updateContact: publicProcedure
    .input(updateContactInputSchema)
    .mutation(({ input }) => updateContact(input)),
    
  deleteContact: publicProcedure
    .input(deleteContactInputSchema)
    .mutation(({ input }) => deleteContact(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
