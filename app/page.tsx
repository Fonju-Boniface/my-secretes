"use client";

import { useState } from "react";
import Image from "next/image";
import HomePage from "./spide";

// Dummy data
const dummyProfileData = {
  imageUrl: "/locked-with-key.svg", // Local image path
  startName: "Locked",
  endName: "Code",
  tags: ["with me,", "we can shape the world with good art of design", "we shall create modern, stunning and responsive designs", "with my skills and creativity, your brand will be taken to a whole new level", "with your desires being my command, I'll execute all tasks accordingly and in time", "The last with your desires being my command, I'll execute all tasks accordingly and in time"], // Example tags
};

export default function Home() {
  const [profileData] = useState(dummyProfileData); // Use the dummy data

  if (!profileData) {
    return <div>Loading Home...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center px-1 md:px-4 lg:px-16 gap-6">
        <div className="flex flex-col justify-center items-center h-[calc(100vh-5rem)] sm:h-fit">
          {profileData.imageUrl && (
            <div className="w-32 h-32 p-1 flex justify-center items-center outline-dashed outline-3 rounded-full outline-primary relative bg-primary">
              <Image
                src={profileData.imageUrl}
                alt={profileData.startName}
                width={50}
                height={50}
                className="w-50 h-50"
              />
            </div>
          )}

          <small className="mt-8 font-bold text-sm sm:text-base md:text-lg">
            Welc<b className="text-primary">ome </b> speed
          </small>
          <h3 className="flex-none text-center mt-1 font-bold text-4xl sm:text-5xl md:text-6xl lg:text-8xl uppercase">
            {profileData.startName}{" "}
            <b className="text-primary">{profileData.endName}</b>
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
            profileData.tags.map((tag, index) => (
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
  );
}
