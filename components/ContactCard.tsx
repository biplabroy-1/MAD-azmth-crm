import { memo } from "react";
import { AlertCircle, Check, Phone, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Contact {
  id: string;
  name: string;
  number: string;
  hasCountryCode: boolean;
}

interface ContactCardProps {
  contact: Contact;
  index: number;
  updateContact: (id: string, field: "name" | "number", value: string) => void;
  removeContact: (id: string) => void;
}

const ContactCard = memo(
  ({ contact, index, updateContact, removeContact }: ContactCardProps) => {
    return (
      <div
        key={contact.id}
        className={`p-6 border ${
          !contact.hasCountryCode && contact.number
            ? "border-red-200 dark:border-red-800"
            : "border-gray-200 dark:border-gray-800"
        } rounded-xl bg-white dark:bg-gray-950 gap-4 relative transition-all hover:shadow-sm group my-4`}
      >
        <div className="absolute right-4 top-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeContact(contact.id)}
            className="text-gray-400 hover:text-destructive rounded-full h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-medium mr-3">
            <span className="text-sm">{index + 1}</span>
          </div>
          <h3 className="font-medium text-lg text-gray-800 dark:text-gray-200">
            Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label
              htmlFor={`name-${contact.id}`}
              className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id={`name-${contact.id}`}
              value={contact.name}
              onChange={(e) =>
                updateContact(contact.id, "name", e.target.value)
              }
              placeholder="John Doe"
              className="focus-visible:ring-primary h-11"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={`number-${contact.id}`}
              className={`flex items-center gap-2 ${
                !contact.hasCountryCode && contact.number
                  ? "text-red-500 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              <Phone className="h-4 w-4" />
              Phone Number (include country code)
              {contact.number &&
                (contact.hasCountryCode ? (
                  <Check className="h-4 w-4 text-green-500 dark:text-green-400 ml-1" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500 dark:text-red-400 ml-1" />
                ))}
            </Label>
            <Input
              id={`number-${contact.id}`}
              value={contact.number}
              onChange={(e) =>
                updateContact(contact.id, "number", e.target.value)
              }
              placeholder="+1 (555) 123-4567"
              className={`focus-visible:ring-primary h-11 ${
                !contact.hasCountryCode && contact.number
                  ? "border-red-300 focus:border-red-500 dark:border-red-800 dark:focus:border-red-700"
                  : ""
              }`}
            />
            {!contact.hasCountryCode && contact.number && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                Missing country code (e.g., +1, +44, +91)
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ContactCard.displayName = "ContactCard";
export default ContactCard;
