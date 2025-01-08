/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { auth } from "@/firebase/firebase";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDatabase, ref, set } from "firebase/database"; // Import Firebase Realtime Database methods
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"; // Import the loading icon

const RegisterPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null); // Track which button is loading

  const router = useRouter();
  const db = getDatabase(); // Initialize Realtime Database instance

  // Check if the user is already logged in when the component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Redirect to home page if the user is logged in
        router.push("/");
      }
    });

    // Cleanup the subscription when the component unmounts
    return () => unsubscribe();
  }, [router]);

  const saveUserData = async (user: any, method: string) => {
    const userData = {
      uid: user.uid,
      email: user.email,
      imageUrl: user.photoURL || "",
      role: "user", // Default role
      signInMethod: method,
    };

    // Save to Realtime Database
    await set(ref(db, `users/${user.uid}`), userData);
  };

  const handleSocialLogin = async (provider: any, method: string) => {
    setLoading(method); // Set the loading state to the method being clicked
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Save user data to Realtime Database
      await saveUserData(user, method);

      // Redirect based on role
      if (user.email === "bonifacefonju@gmail.com") {
        router.push("/pages/auth/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(null); // Reset loading state once the action is complete
    }
  };

  return (
    <div className="bg-gradient-to-b from-purple-500 to-purple-900 w-full flex justify-center items-center flex-col p-1 h-[100vh]">
      <Image
        src="/locked-with-key.svg"
        alt="Google Icon"
        width={30}
        height={30}
        className="w-30 h-30"
      />

      <h2 className="text-xl font-bold text-center mb-10 mt-1 text-white uppercase">Locked Code</h2>
      <div className="p-2 min-w-[300px]  rounded bg-gradient-to-b from-purple-500 to-purple-900">
        <div className="space-y-6 ">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex flex-col space-y-2">
            {/* Google Button */}
            <Button
              onClick={() => handleSocialLogin(new GoogleAuthProvider(), "google")}
              className="w-full h-[50px] py-2 bg-blue-500 text-white text-1xl rounded hover:bg-blue-600 flex items-center justify-center space-x-2 p-2"
            >
              {loading === "google" ? (
                <Loader2 className="animate-spin w-5 h-5" /> // Display loading spinner for Google
              ) : (
                <Image
                  src="/google-logo.svg"
                  alt="Google Icon"
                  width={30}
                  height={30}
                  className="w-30 h-30"
                />
              )}
              <span>Sign up with Google</span>
            </Button>

            {/* GitHub Button */}
            <Button
              onClick={() => handleSocialLogin(new GithubAuthProvider(), "github")}
              className="w-full h-[50px] py-2 bg-gray-800 text-white text-1xl rounded hover:bg-gray-900 flex items-center justify-center space-x-2 p-2"
            >
              {loading === "github" ? (
                <Loader2 className="animate-spin w-5 h-5" /> // Display loading spinner for GitHub
              ) : (
                <Image
                  src="/github-logo.svg"
                  alt="GitHub Icon"
                  width={30}
                  height={30}
                  className="w-30 h-30"
                />
              )}
              <span>Sign up with GitHub</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
