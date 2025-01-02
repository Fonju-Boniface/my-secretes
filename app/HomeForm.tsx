/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set, update } from "firebase/database";
import { database } from "@/firebase/firebase";
import { useToast } from "@/hooks/use-toast";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProfileData {
  imageUrl: string;
  firstName: string;
  lastName: string;
  hello: string;
  there: string;
  tags: string[];
}

export default function HomeForm() {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<ProfileData>({
    imageUrl: "",
    firstName: "",
    lastName: "",
    hello: "",
    there: "",
    tags: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch and display data in real time
  useEffect(() => {
    const dataRef = ref(database, "myHome");

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          // Provide default values to avoid undefined properties
          setProfileData(data);
          setEditData({
            imageUrl: data.imageUrl || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            hello: data.hello || "",
            there: data.there || "",
            tags: data.tags || [],
          });
        } else {
          setProfileData(null);
          setEditData({
            imageUrl: "",
            firstName: "",
            lastName: "",
            hello: "",
            there: "",
            tags: [],
          });
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, imageUrl: e.target.value });
  };

  const handleAddTag = () => {
    setEditData({ ...editData, tags: [...editData.tags, ""] });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const updatedTags = [...editData.tags];
    updatedTags[index] = e.target.value;
    setEditData({ ...editData, tags: updatedTags });
  };

  const handleRemoveTag = (index: number) => {
    const updatedTags = [...editData.tags];
    updatedTags.splice(index, 1);
    setEditData({ ...editData, tags: updatedTags });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataRef = ref(database, "myHome");
      if (!profileData) {
        await set(dataRef, editData); // Add new data
        toast({ description: "Data added successfully!" });
      } else {
        await update(dataRef, editData); // Update existing data
        toast({ description: "Data updated successfully!" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ description: "Failed to save data." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 flex flex-col justify-between items-center">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-blue-500 text-white mt-24">
            {profileData ? "Edit Home Data" : "Add Home Data"}
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogTitle>{profileData ? "Edit Home Data" : "Add Home Data"}</DialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center items-center gap-4">
              <Input
                type="text"
                value={editData.imageUrl || ""}
                onChange={handleImageUrlChange}
                placeholder="Paste Image URL"
              />
              {editData.imageUrl && (
                <Image src={editData.imageUrl} alt="Profile Image" width={50} height={50} />
              )}
            </div>
            <Input
              value={editData.firstName || ""}
              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
              placeholder="First Name"
            />
            <Input
              value={editData.lastName || ""}
              onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
              placeholder="Last Name"
            />
            <Input
              value={editData.hello || ""}
              onChange={(e) => setEditData({ ...editData, hello: e.target.value })}
              placeholder="Greeting 'Hello'"
            />
            <Input
              value={editData.there || ""}
              onChange={(e) => setEditData({ ...editData, there: e.target.value })}
              placeholder="Greeting 'there'"
            />
            <div className="flex flex-col items-center justify-start gap-4 w-full">
              <span className="text-sm pt-5 text-primary">Tags</span>
              {editData.tags.map((tag, index) => (
                <div key={index} className="flex items-center justify-center gap-4 w-full">
                  <Input
                    value={tag || ""}
                    onChange={(e) => handleTagChange(e, index)}
                    placeholder={`Tag ${index + 1}`}
                  />
                  <Button type="button" onClick={() => handleRemoveTag(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" className="w-full opacity-60" onClick={handleAddTag}>
                Add Tag
              </Button>
            </div>
            <div className="flex justify-between items-center gap-4 w-full mt-5">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : profileData ? "Update Data" : "Add Data"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {profileData ? (
        <div className="mt-4 flex flex-col justify-between items-center">
          <div className="items-center flex flex-col gap-4">
            <div className="gap-1">
              <Image
                src={profileData.imageUrl}
                alt="Profile Image"
                width={128}
                height={128}
                className="rounded-full"
              />
              <h3 className="w-full text-center text-primary">
                {profileData.firstName} {profileData.lastName}
              </h3>
            </div>
            <ul className="mt-5">
              {profileData.tags && profileData.tags.length > 0 ? (
                profileData.tags.map((tag: string, index: number) => (
                  <li
                    key={index}
                    className="text-2xl text-left sm:text-center w-full sm:text-sm md:text-base list-inside sm:list-none"
                  >
                    {tag}
                  </li>
                ))
              ) : (
                <p>No tags available.</p>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-8 text-gray-500">No data available. Please add data.</div>
      )}
    </div>
  );
}
