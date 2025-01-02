/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set, update, } from "firebase/database";
import { database } from "@/firebase/firebase";
import { useToast } from "@/hooks/use-toast";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ProfileData {
  name: string;
  profession: string;
  email: string;
  phoneNumber: string;
  location: string;
  address: string;
  imageUrl: string;
}
const MyProfile = () => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [editData, setEditData] = useState<ProfileData>({
    name: "",
    profession: "",
    email: "",
    phoneNumber: "",
    location: "",
    address: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch and display data in real time

  useEffect(() => {
    const dataRef = ref(database, "myProfile");

    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setProfileData(data);
          setEditData(data);
        } else {
          setProfileData(null);
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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataRef = ref(database, "myProfile");
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
    <div className="p-1 flex  flex-col justify-between items-center">
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
                value={editData.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Paste Image URL"
              />
              {editData.imageUrl && (
                <Image src={editData.imageUrl} alt="Profile Image" width={50} height={50} />
              )}
            </div>

            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Full Name"
            />
            <Input
              value={editData.profession}
              onChange={(e) => setEditData({ ...editData, profession: e.target.value })}
              placeholder="Profession"
            />

            <Input
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              placeholder="Email"
            />

            <Input
              value={editData.phoneNumber}
              onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
              placeholder="Phone Number"
            />

            <Input
              value={editData.location}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              placeholder="Location"
            />

            <Input
              value={editData.address}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              placeholder="Address"
            />




            <div className="flex justify-between items-center gap-4 w-full mt-5">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : profileData ? "Update Data" : "Add Data"}
              </Button>

            </div>
          </form>
        </DialogContent>
      </Dialog>

      {profileData ? (
        <div className="mt-4  flex flex-col justify-between items-center ">

          <div className=" items-center flex flex-col gap-4">
            <div className="gap-1">
              <Image
                src={profileData.imageUrl}
                alt="Profile Image"
                width={128}
                height={128}
                className="rounded-full"
              />
              <h3 className="w-full text-center text-primary ">
                name: {profileData.name}
              </h3>
              <h3 className="w-full text-center text-primary ">
                profession: {profileData.profession}
              </h3>
              <h3 className="w-full text-center text-primary ">
                email: {profileData.email}
              </h3>
              <h3 className="w-full text-center text-primary ">
                phoneNumber: {profileData.phoneNumber}
              </h3>
              <h3 className="w-full text-center text-primary ">
                location: {profileData.location}
              </h3>
              <h3 className="w-full text-center text-primary ">
                address: {profileData.address}
              </h3>

            </div>



          </div>

        </div>
      ) : (
        <div className="mt-8 text-gray-500">No data available. Please add data.</div>
      )}



      {/* love */}
    </div>
  );
}



export default MyProfile
