"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Menu,
  Home,
  Briefcase,
  User as LucideUser, // Alias 'User' from lucide-react
  Phone,
  Contact,
  Star,
  Plus,

} from "lucide-react"; // Import X (close) and Menu (bars) icons
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import usePathname from next/navigation
import Progress from "../../progress/ScrollProgressBar/Progress";
import { useRouter } from 'next/navigation';
import { app } from '@/firebase/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import { ref, getDatabase, get } from "firebase/database";

// Define an array of links
const links = [
  { href: "/", label: "Home", description: "Hero section", icon: <Home /> },
  {
    href: "/pages/others/about-me",
    label: "About",
    description: "About me",
    icon: <LucideUser />,
  },
  {
    href: "/pages/projects",
    label: "Portfolio",
    description: "My projects",
    icon: <Briefcase />,
  },
  {
    href: "/pages/others/contact",
    label: "Contact",
    description: "Get in touch",
    icon: <Phone />,
  },
  {
    href: "/pages/others/experience",
    label: "Experience",
    description: "Get in touch",
    icon: <Contact />,
  },
  {
    href: "/pages/others/rating",
    label: "Rating",
    description: "Rate and Review my portfolio",
    icon: <Star />,
  },
];

const SideBar = () => {
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // State for the user's role
  const [isVisible, setIsVisible] = useState(false);
  // const [isVisibleT, setIsVisibleS] = useState(true);
  const pathname = usePathname(); // Get the current pathname using Next.js' usePathname
  // user role

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user role from Realtime Database if the user is authenticated
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.uid}/role`);


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
          });
      } else {
        setUser(null); // Reset user to null when logged out
        setRole(null); // Reset role when logged out
        router.push('/'); // Redirect to the login page if user is logged out
      }
    });

    return () => unsubscribe(); // Clean up subscription on component unmount
  }, [auth, router]);



  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  // Function to check if the current path is active
  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div
        className={`h-full flex justify-center items-end transition-all pb-[3rem] sm:pb-0
        ${isVisible ? "w-[15rem]" : "w-[3rem]"}`}
      >
        {/* Sidebar toggler */}
        <div
          className="flex justify-center items-center h-[3rem] w-[100%] absolute top-0 pb-1"
          onClick={toggleVisibility}
        >
          <Button variant="outline" size="icon" className="relative">
            {isVisible ? (
              <X
                className="h-[1.2rem] w-[1.2rem] rotate-90 scale-100 transition-all duration-300
                  dark:-rotate-0 dark:scale-100"
              />
            ) : (
              <Menu
                className="h-[1.2rem] w-[1.2rem] scale-100 transition-all duration-300 dark:-rotate-0
                  dark:scale-100"
              />
            )}
          </Button>
          {isVisible && (
            <div className="w-[calc(15rem-3rem)] pl-5 text-primary">
              Navigation-Bar
            </div>
          )}
        </div>

        {/* Links */}
        <div
          className="flex justify-start items-center flex-col h-[calc(100%-4rem)] overflow-y-auto
            scrollbar-hide"
        >
          {links.map((link, index) => (
            <Link
              href={link.href}
              key={index}
              passHref
              className={`flex justify-center items-end h-[3.5rem] w-[100%] pl-[.2rem] pb-[.2rem]
              transition-all rounded-bl-lg border-l border-b hover:border-primary
              hover:text-primary hover:mb-2 ${isActive(link.href)
                  ? "border-primary text-primary mb-2"
                  : "border-secondary"
                }`}
            >
              <Button variant="outline" size="icon" className="relative">
                {link.icon}
              </Button>
              {isVisible && (
                <div
                  className="flex justify-center items-start flex-col w-[calc(15rem-3rem)] pl-5 h-[100%]"
                  onClick={toggleVisibility}
                >
                  <p>{link.label}</p>
                  <small>{link.description}</small>
                </div>
              )}
            </Link>
          ))}
          {role === "admin" && (
            <Link
              href='/pages/auth/admin/dashboard'

              passHref
              className={`flex justify-center items-end h-[3.5rem] w-[100%] pl-[.2rem] pb-[.2rem]
              transition-all rounded-bl-lg border-l border-b hover:border-primary
              hover:text-primary hover:mb-2 ${isActive('/pages/auth/admin/dashboard')
                  ? "border-primary text-primary mb-2"
                  : "border-secondary"
                }`}
            >
              <Button variant="outline" size="icon" className="relative">
                <Plus />
              </Button>
              {isVisible && (
                <div
                  className="flex justify-center items-start flex-col w-[calc(15rem-3rem)] pl-5 h-[100%]"
                  onClick={toggleVisibility}
                >
                  <p>Admin</p>
                  <small>Admin Dashboard</small>
                </div>
              )}
            </Link>
          )}
          <div
            className="fixed sm:absolute left-[-100%] bottom-1 sm:left-0 z-[10000] flex justify-center
              items-end h-[3rem] w-[3rem]"
          >
            <Progress />
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
