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

const AboutHobby = () => {
  const [data, setData] = useState<{
    [key: string]: { name: string; iconName: string; text: string };
  }>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    name: "",
    iconName: "",
    text: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);  // For deleting all
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(database, "your-Hobbies");
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
        const itemRef = ref(database, `your-Hobbies/${editId}`);
        await set(itemRef, editData);
        setNotification("Data updated successfully!");
        setEditId(null);
        setIsDialogOpen(false);
      } catch (error) {
        setNotification("Failed to update data." + error);
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
      const newRef = ref(database, "your-Hobbies");
      await push(newRef, editData);
      setNotification("Data added successfully!");
      setEditData({ name: "", iconName: "", text: "" });
      setIsDialogOpen(false);
    } catch (error) {
      setNotification("Failed to add data." + error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete functionality for individual items
  const handleDelete = async (id: string) => {
    setSubmitting(true);
    setNotification(null);

    try {
      const itemRef = ref(database, `your-Hobbies/${id}`);
      await remove(itemRef);
      setNotification("Data deleted successfully!");
      setIsDeleteDialogOpen(false); // Close the delete dialog
    } catch (error) {
      setNotification("Failed to delete data." + error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete All functionality
  const handleDeleteAll = async () => {
    setSubmitting(true);
    setNotification(null);

    try {
      const dataRef = ref(database, "your-Hobbies");
      await remove(dataRef);
      setNotification("All data deleted successfully!");
      setIsDeleteAllDialogOpen(false);  // Close the delete all dialog
    } catch (error) {
      setNotification("Failed to delete all data." + error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">AboutHobby hobbies</h1>

      {/* Add Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Item</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{editId ? "Edit Item" : "Add New Item"}</DialogTitle>
          <form onSubmit={editId ? handleUpdate : handleAdd} className="space-y-4 ">
            <input
              name="name"
              value={editData.name}
              onChange={handleEditChange}
              placeholder="Name"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              name="iconName"
              value={editData.iconName}
              onChange={handleEditChange}
              placeholder="Icon Name"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              name="text"
              value={editData.text}
              onChange={handleEditChange}
              placeholder="Text"
              className="w-full p-2 border border-gray-300 rounded"
            />

            <div className="flex gap-2 justify-cente items-center">
              <Button
                variant="outline"
                type="submit"
                className={`bg-primary w-full text-white flex items-center space-x-2 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
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
          <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
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
          <DialogTitle>Are you sure you want to delete all items?</DialogTitle>
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

      <div className="space-y-4 mt-4">
        {Object.entries(data).map(([id, item]) => (
          <div key={id} className="p-4 border border-gray-300 rounded">
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <i className={`${item.iconName} text-primary`}></i>
            <p>
              <strong>Text:</strong> {item.text}
            </p>
            <div className="flex space-x-4 mt-2">
              <Button variant="outline" onClick={() => handleEdit(id)}>
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteId(id); // Set the item ID to delete
                  setIsDeleteDialogOpen(true); // Open the delete confirmation dialog
                }}
                className="text-red-600"
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
          className="bg-primary w-full"
          onClick={() => setIsDeleteAllDialogOpen(true)} // Open the delete all dialog
          disabled={submitting}
        >
          {submitting ? "Deleting All..." : "Delete All Items"}
        </Button>
      </div>
    </div>
  );
};

// k

export default AboutHobby;