"use client";

import { useState, useEffect } from "react";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Image from "next/image";

type User = {
    id: string;
    uid: string;
    email: string;
    name: string;
    imageUrl: string;
    role: string;
    signInMethod: string;
    accountCreated: string;
    lastSignIn: string;
};

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const database = getDatabase();
        const usersRef = ref(database, "users");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const userList: User[] = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setUsers(userList);
            } else {
                setUsers([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateRole = async (userId: string, newRole: string) => {
        const database = getDatabase();
        const userRef = ref(database, `users/${userId}`);
        await update(userRef, { role: newRole });
        alert(`User role updated to ${newRole}`);
    };

    const deleteUser = async (userId: string) => {
        const database = getDatabase();
        const userRef = ref(database, `users/${userId}`);
        await remove(userRef);
        alert("User deleted successfully");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[100vh]">
                <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
            </div>
        );
    }

    return (
        <div className="p-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
                <Card key={user.id} className="p-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold flex justify-start items-center gap-2">
                            <Image src={user.imageUrl} alt="Profile Image" width={50} height={50} className=' rounded-full p-2 border-primary border' />
                            {user.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-start justify-center flex-col" >

                        <p className="text-sm">
                            <strong>Email:</strong> {user.email}
                        </p>
                        <p className="text-sm">
                            <strong>UID:</strong> {user.uid}
                        </p>
                        <p className="text-sm">
                            <strong>Role:</strong> {user.role}
                        </p>
                        <p className="text-sm">
                            <strong>Sign-In Method:</strong> {user.signInMethod}
                        </p>
                        <p className="text-sm">
                            <strong>Account Created:</strong> {user.accountCreated}
                        </p>
                        <p className="text-sm">
                            <strong>Last Sign-In:</strong> {user.lastSignIn}
                        </p>
                    </CardContent>
                    <CardFooter className="flex space-x-2">

                        <Button
                            onClick={() => updateRole(user.id, user.role === "user" ? "admin" : "user")}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            {user.role === "user" ? "Make Admin" : "Make User"}
                        </Button>
                        <Button
                            onClick={() => deleteUser(user.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                        >
                            Delete
                        </Button>
                    </CardFooter>


                </Card>
            ))}
        </div>
    );
};

export default UserManagement;