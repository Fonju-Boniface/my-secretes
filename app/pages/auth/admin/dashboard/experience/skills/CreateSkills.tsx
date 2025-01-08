"use client";

import { useState, useEffect } from "react";
import { ref, push, set, onValue, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"; // Import Shadcn dialog components
import { database } from "@/firebase/firebase";
import Image from "next/image";
import { Input } from "@/components/ui/input";

const CreateSkills = () => {
  const [data, setData] = useState<{
    [key: string]: {
      title: string; SkDescription: string; SkCategory: string; SkType: string;
      SkPercentage: string;
      SkYears: string; imageUrl: string;
    };
  }>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    title: "",
    SkDescription: "",
    SkCategory: "",
    SkType: "",
    SkPercentage: "",
    SkYears: "",
    imageUrl: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);  // For deleting all
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(database, "MySkills");
    onValue(dataRef, (snapshot) => {
      const snapshotData = snapshot.val();
      setData(snapshotData || {});
    });
  }, []);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setEditData(data[id]);
    setIsDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setSubmitting(true);
      setNotification(null);

      try {
        const itemRef = ref(database, `MySkills/${editId}`);
        await set(itemRef, editData);
        setNotification("Skill updated successfully!");
        setEditId(null);
        setIsDialogOpen(false);
      } catch (error) {
        setNotification("Failed to update skill." + error);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const newRef = ref(database, "MySkills");
      await push(newRef, editData);
      setNotification("Skill added successfully!");
      setEditData({
        title: "", SkDescription: "",
        SkCategory: "", SkType: "",
        SkPercentage: "",
        SkYears: "", imageUrl: "",
      });
      setIsDialogOpen(false);
    } catch (error) {
      setNotification("Failed to add skill." + error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete functionality for individual items
  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setNotification(null);

    try {
      const itemRef = ref(database, `MySkills/${id}`);
      await remove(itemRef);
      setNotification("Skill deleted successfully!");
      setIsDeleteDialogOpen(false); // Close the delete dialog
    } catch (error) {
      setNotification("Failed to delete skill." + error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete All functionality
  const handleDeleteAll = async () => {
    setSubmitting(true);
    setNotification(null);

    try {
      const dataRef = ref(database, "MySkills");
      await remove(dataRef);
      setNotification("All skills deleted successfully!");
      setIsDeleteAllDialogOpen(false);  // Close the delete all dialog
    } catch (error) {
      setNotification("Failed to delete all skills." + error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-2 w-full ">
      <h1 className="text-xl font-bold mb-4">Current skills</h1>

      {/* Add Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New skill</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{editId ? "Edit Item" : "Add New Item"}</DialogTitle>
          <form onSubmit={editId ? handleUpdate : handleAdd} className="space-y-4 ">
            <div className="flex justify-center items-center gap-4">
              <Input
                type="text"
                name="imageUrl"
                value={editData.imageUrl}
                onChange={handleEditChange}
                placeholder="Paste image URL here"
              />
              {editData.imageUrl && (
                <Image
                  src={editData.imageUrl}
                  alt="Skill Image"
                  width={50} height={50}
                />
              )}
            </div>
            <input
              name="title"
              value={editData.title}
              onChange={handleEditChange}
              placeholder="title"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              name="SkDescription"
              value={editData.SkDescription}
              onChange={handleEditChange}
              placeholder="Skill Description"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              name="SkCategory"
              value={editData.SkCategory}
              onChange={handleEditChange}
              placeholder="Skill Category"
              className="w-full p-2 border border-gray-300 rounded"
            />



            <input
              name="SkType"
              value={editData.SkType}
              onChange={handleEditChange}
              placeholder="Skill Type"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              name="SkPercentage"
              value={editData.SkPercentage}
              onChange={handleEditChange}
              placeholder="Skill Percentage"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              name="SkYears"
              value={editData.SkYears}
              onChange={handleEditChange}
              placeholder="Skill Years"
              className="w-full p-2 border border-gray-300 rounded"
            />

            <div className="flex gap-2 justify-cente items-center">
              <Button
                variant="outline"
                type="submit"
                className={`w-full bg-primary text-primary-foreground flex items-center space-x-2 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={submitting}
              >
                {submitting ? (editId ? "Updating..." : "Adding...") : (editId ? "Update" : "Add")}
              </Button>
              <DialogClose>
                {/* Replaced nested button with a div styled as a button */}
                <div
                  className="text-center justify-center border-b border-gray-300
                        bg-gradient-to-b from-zinc-200 p-2 backdrop-blur-2xl
                        dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit
                        rounded-xl lg:border lg:bg-gray-200  lg:dark:bg-zinc-800/30"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </div>
              </DialogClose>
            </div>

          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog for Individual Item */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Are you sure you want to delete this skill?</DialogTitle>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={() => handleDelete(deleteId!)}
              className="text-red-600"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </Button>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent>
          <DialogTitle>Are you sure you want to delete all skills?</DialogTitle>
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={handleDeleteAll}
              className="text-red-600"
              disabled={submitting}
            >
              {submitting ? "Deleting All..." : "Delete All Items"}
            </Button>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4 mt-4 w-full">
        {Object.entries(data).map(([id, item]) => (
          <div key={id} className="  flex flex-col justify-between items-start w-full p-4 border border-gray-300 rounded">
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt="Skill Image"
                width={200}
                height={200}
                className="rounded-md mb-2"
              />
            )}
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p><strong>Skill Description:</strong> {item.SkDescription}</p>
            <p>
              <strong>Skill Category:</strong> {item.SkCategory}
            </p>
            <p>
              <strong>Skill Type:</strong> {item.SkType}
            </p>
            <p>
              <strong>Skill Percentage:</strong> {item.SkPercentage}
            </p>
            <p>
              <strong>Skill Years:</strong> {item.SkYears}
            </p>
            <div className="flex w-full gap-3 mt-2">
              <Button variant="outline" onClick={() => handleEdit(id)} className=" w-full">
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteId(id); // Set the item ID to delete
                  setIsDeleteDialogOpen(true); // Open the delete confirmation dialog
                }}
                className="text-red-600  w-full"
                disabled={submitting}
              >
                {submitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        ))}
      </div>
      

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-md border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8
          backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit
          lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4
          lg:dark:bg-zinc-800/30 ${notification.includes("success")
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {notification}
        </div>
      )}

      {/* Delete All Button */}
      <div className="mt-4">
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground w-full"
          onClick={() => setIsDeleteAllDialogOpen(true)} // Open the delete all dialog
          disabled={submitting}
        >
          {submitting ? "Deleting All..." : "Delete All Items"}
        </Button>
      </div>
    </div>
  );
};

export default CreateSkills;