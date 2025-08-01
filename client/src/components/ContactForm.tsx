
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { User, Phone, Mail, MapPin, Building, FileText, Save, X } from 'lucide-react';
import type { CreateContactInput } from '../../../server/src/schema';

interface ContactFormProps {
  onSubmit: (data: CreateContactInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<CreateContactInput>;
}

export function ContactForm({ onSubmit, onCancel, isLoading = false, initialData }: ContactFormProps) {
  const [formData, setFormData] = useState<CreateContactInput>({
    name: initialData?.name || '',
    phone_number: initialData?.phone_number || null,
    email: initialData?.email || null,
    address: initialData?.address || null,
    company: initialData?.company || null,
    notes: initialData?.notes || null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Convert empty strings to null for optional fields
    const cleanedData: CreateContactInput = {
      name: formData.name.trim(),
      phone_number: formData.phone_number?.trim() || null,
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      company: formData.company?.trim() || null,
      notes: formData.notes?.trim() || null
    };

    await onSubmit(cleanedData);
  };

  const handleInputChange = (field: keyof CreateContactInput, value: string) => {
    setFormData((prev: CreateContactInput) => ({
      ...prev,
      [field]: value || null
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: Record<string, string>) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name - Required */}
        <div className="md:col-span-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Full Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('name', e.target.value)
            }
            placeholder="Enter full name"
            className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
            required
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone_number || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('phone_number', e.target.value)
            }
            placeholder="(555) 123-4567"
            className="mt-1"
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('email', e.target.value)
            }
            placeholder="john@example.com"
            className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company
          </Label>
          <Input
            id="company"
            value={formData.company || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('company', e.target.value)
            }
            placeholder="Company name"
            className="mt-1"
          />
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </Label>
          <Input
            id="address"
            value={formData.address || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleInputChange('address', e.target.value)
            }
            placeholder="Street address"
            className="mt-1"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Notes
          </Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
              handleInputChange('notes', e.target.value)
            }
            placeholder="Additional notes about this contact..."
            className="mt-1 min-h-[100px]"
            rows={4}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Saving...' : 'Save Contact'}
        </Button>
      </div>
    </form>
  );
}
