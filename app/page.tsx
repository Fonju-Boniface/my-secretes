"use client";

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { ref, onValue } from "firebase/database";
import { database } from "@/firebase/firebase";
import Image from "next/image";
import HomeForm from "./HomeForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserIcon } from "lucide-react";

// Define the type for the profile data
interface ProfileData {
  imageUrl: string;
  firstName: string;
  lastName: string;
  hello: string;
  there: string;
  tags: string[];
}

export default function Home() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null); // Explicitly define the type of profileData
  const [user, setUser] = useState<User | null>(null);

  // Listen to authentication state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Fetch profile data in real-time from Firebase
  useEffect(() => {
    const dataRef = ref(database, "myHome");
    const unsubscribe = onValue(
      dataRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfileData(snapshot.val()); // Set profile data to state
        } else {
          setProfileData(null);
        }
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Extract the last name from user.displayName
  const getLastName = (displayName: string | null | undefined) => {
    if (!displayName) return null;
    const nameParts = displayName.split(" ");
    return nameParts.length > 1 ? nameParts[nameParts.length - 1] : displayName; // Return the last part or the entire name
  };

  const lastName = user ? getLastName(user.displayName) : null;

  if (!profileData) {
    return <div>Loading Home...</div>;
  }

  return (
    <>
      <div className=" flex justify-center items-center min-h-screen ">
        <div className="flex flex-col justify-center items-center  px-1 md:px-4 lg:px-16  gap-6">
          <div className="flex flex-col justify-center items-center h-[calc(100vh-5rem)] sm:h-fit">
            <div className="relative flex justify-center items-center">
              {profileData.imageUrl && (
                <div className="w-32 h-32 p-1 flex justify-center items-center outline-dashed outline-3 rounded-full outline-primary relative bg-primary">
                  <Image
                    src={profileData.imageUrl}
                    alt="Log"
                    width={50}
                    height={50}
                    className="w-50 h-50"
                  />
                </div>
              )}
              {user ? (
                <div className="flex justify-center items-center absolute -bottom-0 -right-4 z-10">
                  {/* User Profile Image */}
                  {user.photoURL && (
                    <Image
                      src={user.photoURL}
                      alt="User Profile"
                      width={30}
                      height={30}
                      className="rounded-full p-1 dark:bg-black w-10 h-10 cursor-pointer"
                    />
                  )}
                  {/* User Display Name and Email */}
                  {/* <p className="font-bold">{user.displayName ?? "User"}</p> */}
                  {/* <p className="text-sm text-gray-600">{user.email}</p> */}

                </div>
              ) : (
                <Link href="/pages/auth/register" className="flex justify-center items-center absolute -bottom-0 -right-4 z-10">
                  <Button variant={"outline"} className='rounded-full w-10 h-10'>

                    <UserIcon className=" rounded-full p-1 dark:bg-black w-30 h-30 cursor-pointer" />
                  </Button>
                </Link>
              )}
            </div>

            {/* <b>{profileData.firstName} and { profileData.lastName} </b> */}
            <small className="mt-8 font-bold text-sm sm:text-base md:text-lg">
              {profileData.hello} <b className="text-primary">{lastName ?? profileData.there}</b>
            </small>

            <h3
              className="flex-none text-center mt-1 font-extrabold text-4xl sm:text-5xl md:text-6xl
              lg:text-8xl uppercase"
            >
              {profileData.firstName}{" "}
              <b className="text-primary">{profileData.lastName}</b>
            </h3>

          </div>

          <div
            className="flex flex-col justify-center items-center border-b border-gray-300
            bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl
            dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:w-full
            rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30 text-primary
            p-1 gap-5 sm:gap-1"
          >
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
          </div>
        </div>

      </div>
      <HomeForm />
    </>
  );
}
