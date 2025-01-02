"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { ref, push, set, onValue, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { database } from "@/firebase/firebase";

const AboutMission = () => {
  const [data, setData] = useState<{ [key: string]: { name: string; iconName: string; text: string } }>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: "", iconName: "", text: "" });
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false); // New delete all dialog
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(database, "your-miss-viss");
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
      try {
        const itemRef = ref(database, `your-miss-viss/${editId}`);
        await set(itemRef, editData);
        setNotification("Item updated successfully!");
        setEditId(null);
        setIsDialogOpen(false);
      } catch (error) {
        setNotification("Failed to update item.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newRef = ref(database, "your-miss-viss");
      await push(newRef, editData);
      setNotification("Item added successfully!");
      setEditData({ name: "", iconName: "", text: "" });
      setIsDialogOpen(false);
    } catch (error) {
      setNotification("Failed to add item.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      setSubmitting(true);
      try {
        const itemRef = ref(database, `your-miss-viss/${itemToDelete}`);
        await remove(itemRef);
        setNotification("Item deleted successfully!");
        setDeleteDialogOpen(false);
      } catch (error) {
        setNotification("Failed to delete item.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteAll = async () => {
    setSubmitting(true);
    try {
      const dataRef = ref(database, "your-miss-viss");
      await remove(dataRef);
      setNotification("All items deleted successfully!");
      setDeleteAllDialogOpen(false);
    } catch (error) {
      setNotification("Failed to delete all items.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">About Mission/Vision</h1>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Item</Button>
        </DialogTrigger>


        <DialogContent>
          <DialogTitle>{editId ? "Edit Item" : "Add New Item"}</DialogTitle>

          <form onSubmit={editId ? handleUpdate : handleAdd} className="space-y-4">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" className="bg-red-500 text-white" onClick={handleDeleteConfirm}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent>
          <DialogTitle>Are you sure you want to delete all items?</DialogTitle>
          <div className="flex space-x-4">
            <Button variant="outline" onClick={() => setDeleteAllDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" className="bg-red-500 text-white" onClick={handleDeleteAll}>
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-4 mt-4">
        {Object.entries(data).map(([id, item]) => (
          <div key={id} className="p-4 border border-gray-300 rounded">
            <h2 className="text-lg font-semibold">{item.name}</h2>
            <p><strong>Icon Name:</strong> {item.iconName}</p>
            <i className={`${item.iconName}`}></i>
            <p><strong>Text:</strong> {item.text}</p>
            <div className="flex space-x-2 mt-2">
              <Button variant="outline" onClick={() => handleEdit(id)}>
                Edit
              </Button>
              <Button variant="outline" onClick={() => handleDeleteClick(id)}>
                Delete
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
      <div className="mt-4 ">
        <Button
          variant="outline"
          className="bg-primary w-full"
          onClick={() => setDeleteAllDialogOpen(true)}
          disabled={submitting}
        >
          {submitting ? "Deleting All..." : "Delete All Items"}
        </Button>
      </div>
      {/* with me, */}
      {/* we can shape the world with good art of design */}
      {/* we shall create modern, stunning and responsive designs */}
      {/* with my skills and creativity, your brand will be taken to a whole new level */}
      {/* with your desires being my command, I'll execute all tasks accordingly and in time */}
      {/* and with your love and support, I'll keep pushing the boundaries of what's possible */}
    </div>
  );
};

export default AboutMission;





