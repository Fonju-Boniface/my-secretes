"use client"
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider as NextThemesProvider, } from "next-themes";

import ThemeDataProvider from "@/context/theme-data-provider";
import { metadata } from "./layoutMetadata";
import { useState } from "react";
import SideBar from "./components/navbars/sidebar";
import Profile from "./components/navbars/profile/page";
import TopNav from "./components/navbars/topnav";
import { Button } from "@/components/ui/button";
import { Menu, UserPlus, X } from "lucide-react";
import Footer from "./components/Footer";
import ScrollProgress from "./components/progress/ScrollProgress";
import Progress from "./components/progress/ScrollProgressBar/Progress";
import { Dialog } from "@/components/ui/dialog";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster"
const inter = Inter({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleS, setIsVisibleS] = useState(false);
  // const [isVisibleBg, setIsVisibleBg] = useState(false);

  // const [user, setUser] = useState<User | null>(null);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
    setIsVisibleS(false);
  };
  
  const toggleVisibilities = () => {
    setIsVisible(false);
    setIsVisibleS(!isVisibleS);
  };
  const toggleVisible = () => {
    setIsVisibleS(false);
    setIsVisible(false);
  };
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title ?? "Locked Code"}</title>
        <meta
          name="description"
          content={metadata.description ?? "Default Description"}
        />


        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/js/all.min.js"
          integrity="sha512-6sSYJqDreZRZGkJ3b+YfdhB3MzmuP9R7X1QZ6g5aIXhRvR1Y/N/P47jmnkENm7YL3oqsmI6AK+V6AD99uWDnIw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`${inter.className} w-[100%] flex justify-end items-end relative`}
      >
        <NextThemesProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeDataProvider>
            <div
              className="w-[100%] sm:w-[calc(100%-15rem)] relative px-2 py-2 pb-0 mt-[4rem] flex flex-col
                  justify-center items-center"
            >
                <div className={`fixed top-0 h-[100vh] z-20 w-[100%]  dark:bg-zinc-900
                      bg-zinc-100 transition-all ${isVisible || isVisibleS
                      ? " bg-red-500 left-0"
                      : "bg-green-600 left-[-100%] "
                    } flex flex-col
                  justify-center items-center`} onClick={toggleVisible}>
                    back
                </div>
              <div className="flex justify-start items-start w-[100%] flex-col">


                <div
                  className={`shadow-xl flex justify-center items-end fixed top-0 z-30 dark:bg-zinc-900
                      bg-zinc-100 left-0 sm:left-0 transition-all ${isVisible
                      ? " bg-red-500 left-0"
                      : "bg-green-600 left-[-100%]"
                    } sm:h-[100vh] h-[calc(100vh-3rem)]`}
                >
                  <SideBar />

                </div>

                <div
                  className={`shadow-xl w-[12rem] sm:h-[100vh] h-[calc(100vh-3rem)] flex justify-between
                      items-center flex-col fixed top-0 sm:left-[3rem] background-primary sm:z-10 z-30
                      dark:bg-zinc-900 bg-zinc-100 overflow-y-auto transition-all ${isVisibleS
                      ? " bg-red-500 left-0"
                      : "bg-green-600 left-[-12rem]"
                    }`}
                >
                  {/* profile */}
                  <Profile />
                </div>
                {/* topnav */}

                <TopNav />
              </div>
              <div
                className="h-[3rem] hover:shadow-lg transition duration-300 text-center flex
                    sm:bottom-[-100%] items-center justify-between border-b border-gray-300
                    bg-gradient-to-b from-zinc-200 p-1 pb-3 backdrop-blur-2xl
                    dark:border-neutral-800 dark:from-inherit rounded-md lg:border lg:bg-gray-200
                    dark:bg-zinc-900 w-full fixed bottom-0 left-0 z-[10000]"
              >
                <div className="flex justify-center items-end h-[3rem] w-[3rem]">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVisibility}
                    // className={`${isVisible && "bg-primary"}`}
                  >
                    {!isVisible ? (
                      <Menu
                        className={`h-[1.2rem] w-[1.2rem] scale-100 transition-all duration-300 dark:-rotate-0
                            dark:scale-100`}
                      />
                    ) : (
                      <X
                        className="h-[1.2rem] w-[1.2rem] rotate-90 scale-100 transition-all duration-300
                            dark:-rotate-0 dark:scale-100"
                      />
                    )}
                  </Button>
                </div>
                <div onClick={toggleVisible} className="flex justify-center items-end h-[3rem] w-[3rem]">
                  <Progress />
                </div>
                <div className="flex justify-center items-end h-[3rem] w-[3rem]">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVisibilities}
                    // className={`${isVisibleS && "bg-primary"}`}
                  >
                    <UserPlus
                      size={32}
                      strokeWidth={3}
                      className="h-[1.2rem] w-[1.2rem] scale-100 transition-all duration-300 dark:-rotate-0
                          dark:scale-100"
                    />
                  </Button>
                </div>
              </div>
              <Dialog /> {/* Include the Dialog here */}
              <div className="w-full relative">
                <main className="min-h-[100vh] overflow-y-auto w-full mb-10">
                  
                  <ScrollProgress />

                  {children}
                </main>
                {/* 
                  
                  */}
                <div className=" flex justify-center items-center sm:mb-[.3rem] mb-2 mt-7 w-full">
                  {/* footer */}
                  <Footer />
                </div>
              </div>
            </div>
            <Toaster />
          </ThemeDataProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}
