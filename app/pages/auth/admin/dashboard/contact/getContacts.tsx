"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "@/firebase/firebase"; // Replace with your Firebase initialization file
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";


type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
  message: string;
  photoURL?: string;
};

const GetContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const contactsRef = ref(database, "contacts");

    // Listen for changes in the 'contacts' collection
    const unsubscribe = onValue(contactsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedData = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setContacts(formattedData);
      } else {
        setContacts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const contactRef = ref(database, `contacts/${id}`);
      await remove(contactRef);
      toast({
        title: "successfully deleted",
        description: "Contact deleted successfully!",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "deleted Error",
        description: "Failed to delete contact. Please try again!",
        variant: "default",
      });
    }
  };

  if (loading) {
    return <p>Loading contacts...</p>;
  }

  if (contacts.length === 0) {
    return <p>No contacts found.</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Contacts</h2>
      <ul className="space-y-4">
        {contacts.map((contact) => (
          <li key={contact.id} className="border p-4 rounded shadow-sm">
            <div className="flex items-center space-x-4">
              {contact.photoURL && (
                <Image
                  src={contact.photoURL}
                  alt={`${contact.firstName} ${contact.lastName}`}
                  height={12}
                  width={12}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <h3 className="text-lg font-bold">
                  {contact.firstName} {contact.lastName}
                </h3>
                <p className="text-sm text-gray-600">{contact.email}</p>
                <p className="text-sm text-gray-600">{contact.phone}</p>
              </div>
            </div>
            <p className="mt-2 text-gray-700">{contact.message}</p>
            {contact.country && (
              <p className="mt-1 text-sm text-gray-500">Country: {contact.country}</p>
            )}
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => handleDelete(contact.id)}
            >
              Delete Contact
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GetContacts;
