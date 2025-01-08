/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { auth } from "@/firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore or Realtime Database (if needed)
      // This is a placeholder for fetching role data. Replace with actual fetching logic.
      const isAdmin = user.email === "admin@example.com"; // Example admin detection

      if (isAdmin) {
        router.push("/pages/auth/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-800 to-black w-full flex justify-center items-center h-[100vh]">
      <div className="p-6 bg-white rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
