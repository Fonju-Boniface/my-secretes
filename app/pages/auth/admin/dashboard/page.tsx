"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ref, getDatabase, get } from "firebase/database";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Home, Briefcase, Phone, User } from "lucide-react";
import HomeForm from "./home/HomeForm";
import CreateProjects from "./projects/createProject";
import AboutMission from "./about/AboutMission";
import AboutHobby from "./about/AboutHobby";
import AboutText from "./about/AboutText";
import GetContacts from "./contact/getContacts";
import MyProfile from "./profile/myProfile";
import ExperienceSummaryForm from "./experience/experienceSummary/ExperienceSummaryForm";
import CreateSkills from "./experience/skills/CreateSkills";
import CreateCurrentSkills from "./experience/currentSkills/CreateCurrentSkills";
import RatingsList from "./ratings/RatingsList";
import UserManagement from "./Users/UserManagement";
import Resume from "./resume/Resume";

const Tabs = [
  
  {
    value: "HomeForm",
    label: "HomeForm",
    description: "Create and manage Home.",
    icon: <Home />,
    component: <HomeForm />,
  },
  {
    value: "Resume",
    label: "Resume",
    description: "Upload a resume.",
    icon: <Home />,
    component: <Resume />,
  },
  
  {
    value: "MyProfile",
    label: "MyProfile",
    description: "Create and manage MyProfile.",
    icon: <User />,
    component: <MyProfile />,
  },
  {
    value: "Projects",
    label: "Projects",
    description: "Create and manage Projects.",
    icon: <Briefcase />,
    component: <CreateProjects />,
  },
  {
    value: "createHobby",
    label: "create Hobby",
    description: "Create and manage Hobbies.",
    icon: <Briefcase />,
    component: <AboutHobby />,
  },
  {
    value: "AboutMission",
    label: "About Mission",
    description: "Create and manage Missions.",
    icon: <Briefcase />,
    component: <AboutMission />,
  },
  {
    value: "AboutText",
    label: "About Text",
    description: "Create and manage about text.",
    icon: <Briefcase />,
    component: <AboutText />,
  },
  {
    value: "Contacts",
    label: "Contacts",
    description: "Create and manage contacts.",
    icon: <Phone />,
    component: <GetContacts />,
  },
  {
    value: "ExperienceSummary",
    label: "Experience Summary",
    description: "Create and manage Experience Summary Form.",
    icon: <Phone />,
    component: <ExperienceSummaryForm />,
  },
  {
    value: "CreateSkills",
    label: "Create Skills",
    description: "Create and manage Create Skills.",
    icon: <Phone />,
    component: <CreateSkills />,
  },
  {
    value: "CurrentSkills",
    label: "Current Skills",
    description: "Create and manage current Skills.",
    icon: <Phone />,
    component: <CreateCurrentSkills />,
  },
  {
    value: "RatingsList",
    label: "Ratings List",
    description: "Create and manage Ratings List.",
    icon: <Phone />,
    component: <RatingsList />,
  },
  {
    value: "Users",
    label: "Users List",
    description: "Create and manage users.",
    icon: <User />,
    component: <UserManagement />,
  },
];

const AdminDashboard = () => {

    const [selectedTab, setSelectedTab] = useState<string>(Tabs[0].value); // Specify type explicitly
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const db = getDatabase();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = ref(db, `users/${user.uid}/role`);
          const snapshot = await get(userRef);

          if (snapshot.exists() && snapshot.val() === "admin") {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
            router.push("/"); // Redirect to home or login
          }
        } catch (error) {
          console.error("Error fetching role:", error);
          setIsAuthorized(false);
          router.push("/"); // Redirect on error
        } finally {
          setLoading(false);
        }
      } else {
        setIsAuthorized(false);
        router.push("/"); // Redirect to home or login
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router]);


  const isActive = (value: string): boolean => selectedTab === value;

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  if (!isAuthorized) {
    return null; // Prevent rendering if the user is unauthorized
  }

  const activeTab = Tabs.find((tab) => tab.value === selectedTab);

  return (
    <div className="container relative min-h-[100vh] flex justify-center items-center flex-col">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="fixed top-14 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Select Section</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sections</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={selectedTab}
              onValueChange={setSelectedTab}
            >
              {Tabs.map((tab, index) => (
                <DropdownMenuRadioItem
                  key={index}
                  value={tab.value}
                  className={`flex gap-2 justify-start items-center h-[2rem] w-[100%] pl-[2rem] pb-[.2rem]
                    transition-all rounded-bl-lg border-l border-b hover:border-primary
                    hover:text-primary hover:mb-2 ${
                      isActive(tab.value)
                        ? "border-primary text-primary mb-2"
                        : "border-secondary"
                    }`}
                >
                
                  {/* <span>{tab.icon}</span> */}
                  {tab.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-16  flex justify-center flex-col items-center">
        {activeTab && (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-lg">{activeTab.icon}</div>
              <h2 className="text-xl font-semibold">{activeTab.label}</h2>
            </div>
            <p className="text-gray-600 mb-4">{activeTab.description}</p>
            <div>{activeTab.component}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
