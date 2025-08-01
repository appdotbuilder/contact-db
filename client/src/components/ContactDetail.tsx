
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ContactForm } from './ContactForm';
import { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  FileText, 
  Edit, 
  Trash2, 
  Calendar,
  X,
  AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Contact, UpdateContactInput, CreateContactInput } from '../../../server/src/schema';

interface ContactDetailProps {
  contact: Contact;
  onUpdate: (data: UpdateContactInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export function ContactDetail({ contact, onUpdate, onDelete, isLoading = false }: ContactDetailProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (updateData: CreateContactInput) => {
    const updatePayload: UpdateContactInput = {
      id: contact.id,
      ...updateData
    };
    await onUpdate(updatePayload);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await onDelete(contact.id);
  };

  if (isEditing) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Edit Contact
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ContactForm
            initialData={{
              name: contact.name,
              phone_number: contact.phone_number,
              email: contact.email,
              address: contact.address,
              company: contact.company,
              notes: contact.notes
            }}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-800">{contact.name}</CardTitle>
              {contact.company && (
                <Badge variant="secondary" className="mt-1">
                  <Building className="w-3 h-3 mr-1" />
                  {contact.company}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    Delete Contact
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{contact.name}</strong>? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Contact
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phone */}
          {contact.phone_number && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">{contact.phone_number}</p>
              </div>
            </div>
          )}

          {/* Email */}
          {contact.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{contact.email}</p>
              </div>
            </div>
          )}

          {/* Address */}
          {contact.address && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg md:col-span-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium text-gray-800">{contact.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {contact.notes && (
          <>
            <Separator />
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Notes</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            </div>
          </>
        )}

        {/* Timestamps */}
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Created: {contact.created_at.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Updated: {contact.updated_at.toLocaleDateString()}</span>
          </div>
        </div>

        {/* Empty state for missing information */}
        {!contact.phone_number && !contact.email && !contact.address && !contact.notes && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>No additional contact information available.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="mt-3"
            >
              <Edit className="w-4 h-4 mr-2" />
              Add Information
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
