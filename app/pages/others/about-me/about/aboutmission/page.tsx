import { useState, useEffect } from "react";
import { ref, push, set, onValue, remove } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"; // Import Shadcn dialog components
import { database } from "@/firebase/firebase";

const AboutMission = () => {
    const [data, setData] = useState<{ [key: string]: { name: string; iconName: string; text: string } }>({});
    const [editId, setEditId] = useState<string | null>(null);
    const [editData, setEditData] = useState({ name: '', iconName: '', text: '' });
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const dataRef = ref(database, 'your-miss-viss');
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
                const itemRef = ref(database, `your-miss-viss/${editId}`);
                await set(itemRef, editData);
                setNotification('Data updated successfully!');
                setEditId(null);
                setIsDialogOpen(false);
            } catch (error) {
                setNotification('Failed to update data.' + error);
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
            const newRef = ref(database, 'your-miss-viss');
            await push(newRef, editData);
            setNotification('Data added successfully!');
            setEditData({ name: '', iconName: '', text: '' });
            setIsDialogOpen(false);
        } catch (error) {
            setNotification('Failed to add data.' + error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const itemRef = ref(database, `your-miss-viss/${id}`);
                await remove(itemRef);
                setNotification('Item deleted successfully!');
            } catch (error) {
                setNotification('Failed to delete item.' + error);
            }
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-xl font-bold mb-4">About miss viss</h1>

            {/* Add Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                {/* Ensuring DialogTrigger has only one child */}
                <DialogTrigger asChild>
                    {/* The Button component is the only child */}
                    <Button variant="outline">Add New Item</Button>
                </DialogTrigger>

                <DialogContent>
                    <DialogTitle>{editId ? "Edit Item" : "Add New Item"}</DialogTitle>
                    <form
                        onSubmit={editId ? handleUpdate : handleAdd}
                        className="space-y-4"
                    >
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
                        <Button
                            variant="outline"
                            type="submit"
                            className={`bg-primary w-full text-white flex items-center space-x-2 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                            disabled={submitting}
                        >
                            {submitting ? (editId ? "Updating..." : "Adding...") : (editId ? "Update" : "Add")}
                        </Button>
                        <DialogClose>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </form>
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
                            <Button
                                variant="outline"
                                onClick={() => handleEdit(id)}
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleDelete(id)}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Notification */}
            {notification && (
                <div className={`p-4 rounded-md border-b border-gray-300
                    bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl
                    dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static
                    lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 ${notification.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {notification}
                </div>
            )}
        </div>
    );
};

export default AboutMission;
