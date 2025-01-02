
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebase/firebase";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  imageUrl: string;
  name: string;
  profession: string;
  email: string;
  phoneNumber: string;
  location: string;
  address: string;
}

const Me = () => {
  const { toast } = useToast(); // Use ShadCN toast
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Fetch data from Firebase
  useEffect(() => {
    const dataRef = ref(database, "myProfile");

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfileData(snapshot.val());
        } else {
          setProfileData(null);
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch profile data.",
          variant: "destructive",
        });
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [toast]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${text} has been copied.`,
    });
  };

  if (!profileData) {
    return <div className="mt-8 text-gray-500">Loading no profile data.</div>;
  }


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
