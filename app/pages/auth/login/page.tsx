/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { auth } from "@/firebase/firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getDatabase, ref, set } from "firebase/database";

const Login = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const router = useRouter();
  const database = getDatabase();

  const saveUserToDatabase = (user: any, signInMethod: string) => {
    const userRef = ref(database, `users/${user.uid}`);
    const userData = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || "Anonymous", // Get the user's name
      imageUrl: user.photoURL || "",
      role: "user", // Default role
      signInMethod,
      accountCreated: user.metadata.creationTime, // Account creation time
      lastSignIn: user.metadata.lastSignInTime,   // Last sign-in time
    };

    return set(userRef, userData);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    setLoading("google");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await saveUserToDatabase(user, "google");

      // Redirect based on user role or logic
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(null);
    }
  };

  const handleGithubLogin = async () => {
    const provider = new GithubAuthProvider();
    setError(null);
    setLoading("github");
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await saveUserToDatabase(user, "github");

      // Redirect based on user role or logic
      router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(null);
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
              onClick={handleGoogleLogin}
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
              onClick={handleGithubLogin}
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

export default Login;
