"use client";

import React, { useState } from "react";
import Image from "next/image"; // Import the Next.js Image component
import { Input } from "@/components/ui/input"; // Shadcn Input component
import { Copy } from "lucide-react"; // Import Copy icon from lucide-react
import { toast } from "react-toastify"; // Import toast from react-toastify

const Me = () => {
  // Dummy profile data
  const [profileData] = useState({
    imageUrl: "/1.jpg", // Local image path
    name: "John Doe",
    profession: "Software Engineer",
    email: "johndoe@example.com",
    phoneNumber: "+1234567890",
    location: "New York, USA",
    address: "123 Main Street, Apt 4B",
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${text} copied to clipboard`); // Use toast for notifications
  };

  return (
    <div className="shadow-lg rounded-lg p-2">
      {/* Profile Image */}
      {profileData.imageUrl && (
        <div className="flex justify-center mb-3">
          <Image
            src={profileData.imageUrl}
            alt={profileData.name}
            width={185} // 12rem = 192px
            height={185}
            className="rounded-lg object-cover shadow-xl"
          />
        </div>
      )}

      {/* Name */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <Input
          readOnly
          value={profileData.name}
          className="background-primary dark:bg-zinc-900 border-l border-b border-secondary mt-2 h-8 custom-input"
        />
      </div>

      {/* Profession */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Profession
        </label>
        <Input
          readOnly
          value={profileData.profession}
          className="background-primary dark:bg-zinc-900 border-l border-b border-secondary mt-2 h-8 focus:outline-none focus:ring-0 custom-input"
        />
      </div>

      {/* Email */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <div className="flex items-center">
          <Input
            readOnly
            value={profileData.email}
            className="background-primary dark:bg-zinc-900 border-l border-b border-secondary mt-2 h-8 focus:outline-none focus:ring-0 custom-input"
          />
          <button
            onClick={() => copyToClipboard(profileData.email)}
            className="ml-2 p-2 text-gray-600 hover:text-primary"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Telephone */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Telephone
        </label>
        <div className="flex items-center">
          <Input
            readOnly
            value={profileData.phoneNumber}
            className="background-primary dark:bg-zinc-900 border-l border-b border-secondary mt-2 h-8 focus:outline-none focus:ring-0 custom-input"
          />
          <button
            onClick={() => copyToClipboard(profileData.phoneNumber)}
            className="ml-2 p-2 text-gray-600 hover:text-primary"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Location */}
      <div className="mb-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <Input
          readOnly
          value={profileData.address}
          className="background-primary dark:bg-zinc-900 border-l border-b border-secondary mt-2 h-8 focus:outline-none focus:ring-0 custom-input"
        />
      </div>
      {/* <DownResume /> */}
    </div>
  );
};

export default Me;
