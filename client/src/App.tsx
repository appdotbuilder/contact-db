
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/ContactForm';
import { ContactDetail } from '@/components/ContactDetail';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { User, Phone, Mail, Building, FileText, Plus, Search } from 'lucide-react';
import type { Contact } from '../../server/src/schema';

function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadContacts = useCallback(async () => {
    try {
      const result = await trpc.getContacts.query();
      setContacts(result);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleCreateContact = async (contactData: Parameters<typeof trpc.createContact.mutate>[0]) => {
    setIsLoading(true);
    try {
      const newContact = await trpc.createContact.mutate(contactData);
      setContacts((prev: Contact[]) => [...prev, newContact]);
      setIsFormOpen(false);
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContact = async (contactData: Parameters<typeof trpc.updateContact.mutate>[0]) => {
    setIsLoading(true);
    try {
      const updatedContact = await trpc.updateContact.mutate(contactData);
      if (updatedContact) {
        setContacts((prev: Contact[]) => 
          prev.map((contact: Contact) => 
            contact.id === updatedContact.id ? updatedContact : contact
          )
        );
        setSelectedContact(updatedContact);
      }
    } catch (error) {
      console.error('Failed to update contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    setIsLoading(true);
    try {
      const result = await trpc.deleteContact.mutate({ id });
      if (result.success) {
        setContacts((prev: Contact[]) => prev.filter((contact: Contact) => contact.id !== id));
        if (selectedContact?.id === id) {
          setSelectedContact(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete contact:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact: Contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <User className="w-10 h-10 text-blue-600" />
            Contact Database
          </h1>
          <p className="text-gray-600">Manage your contacts with ease</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Contacts ({filteredContacts.length})</CardTitle>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {contacts.length === 0 ? 'No contacts yet' : 'No contacts match your search'}
                    </p>
                    {contacts.length === 0 && (
                      <Button 
                        onClick={() => setIsFormOpen(true)}
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first contact
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredContacts.map((contact: Contact) => (
                      <div
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 border ${
                          selectedContact?.id === contact.id 
                            ? 'bg-blue-100 border-blue-300' 
                            : 'bg-white border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{contact.name}</h3>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                              {contact.phone_number && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  <span className="truncate">{contact.phone_number}</span>
                                </div>
                              )}
                              {contact.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{contact.email}</span>
                                </div>
                              )}
                            </div>
                            {contact.company && (
                              <div className="flex items-center gap-1 mt-1">
                                <Building className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500 truncate">{contact.company}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact Detail/Form */}
          <div className="lg:col-span-2">
            {isFormOpen ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    Add New Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm
                    onSubmit={handleCreateContact}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            ) : selectedContact ? (
              <ContactDetail
                contact={selectedContact}
                onUpdate={handleUpdateContact}
                onDelete={handleDeleteContact}
                isLoading={isLoading}
              />
            ) : (
              <Card className="shadow-lg">
                <CardContent className="pt-16">
                  <div className="text-center py-12">
                    <User className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h2 className="text-2xl font-semibold text-gray-600 mb-4">Welcome to Contact Database</h2>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Select a contact from the list to view details, or create a new contact to get started.
                    </p>
                    <Button 
                      onClick={() => setIsFormOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Contact
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Info Banner about stub implementation */}
        <div className="mt-8">
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Development Notice</h3>
                  <p className="text-sm text-amber-700">
                    This application is using stub API handlers. The backend handlers in the server/src/handlers/ 
                    directory need to be implemented with actual database operations for full functionality.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
