"use client";
import { app } from '@/firebase/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database'; // Import Firebase Realtime Database methods
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const UserProfile = () => {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // State for the user's role
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track role fetching

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user role from Realtime Database if the user is authenticated
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.uid}/role`);

        setLoading(true); // Set loading to true when fetching role

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              setRole(snapshot.val()); // Set the role from Realtime Database
            } else {
              setRole('user'); // Default role if not found
            }
          })
          .catch((error) => {
            console.error('Error fetching role:', error);
            setRole('user'); // Fallback role in case of error
          })
          .finally(() => {
            setLoading(false); // Set loading to false once role is fetched
          });
      } else {
        setUser(null); // Reset user to null when logged out
        setRole(null); // Reset role when logged out
        router.push('/'); // Redirect to the login page if user is logged out
      }
    });

    return () => unsubscribe(); // Clean up subscription on component unmount
  }, [auth, router]);

  // Show loading message when fetching role or user
  if (loading) {
    return <p>Loading user details...</p>;
  }

  // Show message if the user is not logged in
  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="text-center flex justify-center items-center">
      <div className="flex justify-center items-center">
        {/* User Profile Image */}
        {user.photoURL && (
          <Image
            src={user.photoURL}
            alt="User Profile"
            width={30}
            height={30}
            className="rounded-full w-10 h-10 cursor-pointer"
          />
        )}
        <p>Email: {user.email}</p>
        <p>Role: {role || "No role assigned"}</p> {/* Display the role fetched from Realtime Database */}
      </div>
    </div>
  );
};

export default UserProfile;



{/* <li
            key={rating.id}
            className="p-4 bg-white shadow rounded-lg border border-gray-200"
          >
            <div className="flex items-center mb-2">
              <Image
                src={rating.photoURL || "/default-avatar.png"}
                alt={rating.firstName || "User Avatar"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full mr-4"
              />
              <div>
                <h3 className="text-lg font-semibold">
                  {rating.firstName || "Anonymous"} {rating.lastName || ""}
                </h3>
                <p className="text-sm text-gray-500">{rating.email || "N/A"}</p>
              </div>
            </div>
            <p className="text-gray-800">{rating.message || "No message provided."}</p>
            <p className="mt-2 text-yellow-500">Rating: {rating.rating || 0} ⭐</p>
            <p className="text-sm text-gray-400 mt-1">
              Submitted on:{" "}
              {rating.timestamp
                ? new Date(rating.timestamp).toLocaleString()
                : "Unknown"}
            </p>
            {role === "admin" && <Button
              onClick={() => handleDelete(rating.id)}
              className="mt-4 text-red-600 hover:text-red-800"
            >
              Delete Rating
            </Button> }
            
          </li> */}
