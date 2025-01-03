"use client";
import React from "react";
import Skills from "./skills/Skills";
// import CreateSkills from "./skills/CreateSkills";
import GetCurrentSkills from "./currentSkills/GetCurrentSkills";
// import CreateCurrentSkills from "./currentSkills/CreateCurrentSkills";
import Summary from "./experienceSummary/Summary";
import Exp from "./experienceSummary/Exp";

const Experience = () => {
  return (
    <>
      <div className=" mt-8 flex justify-center items-center sm:h-auto h-[70vh] w-full">
      <h1 className="text-5xl font-bold text-center">
        My <b className="text-primary">Experience</b>
      </h1>
      </div>
      <main
        className="min-h-screen w-full flex flex-col items-start text-center justify-start my-24
          rounded-lg shadow-md border-b border-gray-300 bg-gradient-to-b
          from-zinc-200 backdrop-blur-2xl dark:border-neutral-800
          dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl
          lg:border lg:bg-gray-200 lg:dark:bg-zinc-800/30 gap-20 p-1"
      >
        {/*  */}
        <div className="flex items-start text-center justify-start flex-wrap gap-5 w-full ">
          {/* <Summary Section /> */}
          <Exp />
          <Summary />
          {/*  */}


          {/* <Skills Section /> */}

          <Skills />
          {/* <CreateSkills /> */}

          {/* <Currently learning Skills Section /> */}
          <GetCurrentSkills />
          {/* <CreateCurrentSkills /> */}



          {/* DownResume */}
        </div>
      </main>
    </>
  );
};

export default Experience;
