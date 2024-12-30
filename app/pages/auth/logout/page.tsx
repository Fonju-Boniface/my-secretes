// import { Button } from '@/components/ui/button';
import { app } from '@/firebase/firebase';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

const Logout = () => {
    const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null); // Ensure user is reset to null when logged out
        router.push("/"); // Redirect to login page if user is logged out
      }
    });
    return () => unsubscribe(); // Clean up subscription when component unmounts
  }, [auth, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Update user state to null after logout
      router.push("/"); // Redirect to login page after logout
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error signing out:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };
  return (
    
      <div className="text-center flex justify-center items-center">
        {user ? (
          <div className='flex justify-center items-center'>
            {/* User Profile Image */}
            {user.photoURL && (
              <Image
              onClick={handleLogout}
                src={user.photoURL}
                alt="User Profile"
                width={30}
                height={30}
                className="rounded-full w-10 h-10 "
              />
            )}
            {/* User Display Name and Email */}
            {/* <p className="font-bold">{user.displayName ?? "User"}</p> */}
            {/* <p className="text-sm text-gray-600">{user.email}</p> */}
          </div>
        ) : (
          <Link href='/pages/auth/register'>
            <Image
           
                src="/15.jpg"
                alt="User Profile"
                width={30}
                height={30}
                className="rounded-full w-10 h-10 "
              />
          </Link>
        )}
      
      </div>

  
  )
}

export default Logout