// import { useEffect, useState } from 'react';
// // import { fetchHomeData, HomeData } from '../lib/fetchHomeData'; // Adjust the path
// import Image from 'next/image';
// import { fetchHomeData, HomeData } from '@/lib/fetchHomeData';

// const HomePage = () => {
//   const [homeData, setHomeData] = useState<HomeData[] | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const getData = async () => {
//       try {
//         const data = await fetchHomeData();
//         setHomeData(data);
//       } catch (err) {
//         setError('Failed to fetch data');
//       }
//     };

//     getData();
//   }, []);
// //
//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (!homeData) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div>
//       <h1>Home Data</h1>
//       {homeData.map((item) => (
//         <div key={item._id}>
//           <h2>{item.title}</h2>
//           {item.image?.asset?.url && (
//             <Image
//               src={item.image.asset.url}
//               alt={item.title}
//             //   style={{ maxWidth: '300px', height: 'auto' }}
//               width={200}
//               height={200}
//             />
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default HomePage;




'use client';

import React, { useEffect, useState } from "react";
import { ref, onValue, update, push } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubIcon, Globe, Mail, MessageCircle, Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { useParams } from 'next/navigation'; // Import useParams hook
import { database } from "@/firebase/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Project = {
  id: string;
  projectName: string;
  imageUrl?: string;
  descriptionSummary: string;
  description: string;
  githubLink: string;
  liveLink: string;
  generalTools?: string[];
  frontendTools?: string[];
  backendTools?: string[];
  researchTools?: string[];
  deploymentTools?: string[];
  likes?: number;
  likedBy?: Record<string, boolean>;
  comments?: {
    id: string;
    userId: string;
    email: string;
    imageUrl: string;
    name: string;
    text: string;
    timestamp: number;
  }[];
};

const ProjectDetails = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const { id } = useParams();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    if (id) {
      const projectRef = ref(database, `MyProjects/${id}`);
      const unsubscribeDatabase = onValue(
        projectRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setProject({
              id,
              ...data,
              comments: data.comments
                ? Object.keys(data.comments).map((key) => ({
                    id: key,
                    ...data.comments[key],
                  }))
                : [],
            });
          } else {
            setError("Project not found.");
          }
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching project details:", error);
          setError("Failed to load project details.");
          setLoading(false);
        }
      );

      return () => {
        unsubscribeAuth();
        unsubscribeDatabase();
      };
    }
  }, [id]);

  const handleLikeToggle = (projectId: string, currentLikes: number, likedBy: Record<string, boolean>) => {
    const userId = currentUser?.uid;
    if (!userId) return; // Prevent errors if no user is signed in

    const projectRef = ref(database, `MyProjects/${projectId}`);
    const currentLikeCount = currentLikes ?? 0;
    const updates = likedBy[userId]
      ? { likes: Math.max(currentLikeCount - 1, 0), [`likedBy/${userId}`]: null }
      : { likes: currentLikeCount + 1, [`likedBy/${userId}`]: true };

    update(projectRef, updates).catch((error) => {
      console.error("Failed to update like:", error);
      alert("Failed to update like. Please try again.");
    });
  };

  const handleAddComment = (projectId: string) => {
    if (!currentUser || !commentText.trim()) return;

    const commentData = {
      userId: currentUser.uid,
      email: currentUser.email || "Unknown User",
      imageUrl: currentUser.photoURL || "/default-avatar.png",
      name: currentUser.displayName || "Anonymous",
      text: commentText,
      timestamp: Date.now(),
    };

    const projectRef = ref(database, `MyProjects/${projectId}/comments`);
    push(projectRef, commentData)
      .then(() => {
        setCommentText("");
        setOpenDialog(null);
      })
      .catch((error) => {
        console.error("Failed to add comment:", error);
        alert("Failed to add comment. Please try again.");
      });
  };
  if (loading) return <p>Loading project details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!project) return null;

  return (
    <div className="relative">
      <h1 className="text-xl text-center sm:text-3xl md:text-5xl font-bold mb-4 mt-16">{project.projectName}</h1>
      {project.imageUrl && (
        <Image
          src={project.imageUrl}
          alt="Project Image"
          width={400}
          height={400}
          className="rounded-sm w-[100%] h-[auto] object-cover"
        />
      )}
      {/*  */}
      <div className="flex justify-center items-start flex-col gap-1 my-3 mt-8">
        <p>
          Description Summary:{" "}
          <b className="text-primary">{project.descriptionSummary}</b>
        </p>
        <p>
          Description: <b className="text-primary">{project.description}</b>
        </p>
        {/*  */}

      </div>
      {/* Tags */}
      <div className="mt-4 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {(
          ["generalTools", "frontendTools", "backendTools", "researchTools", "deploymentTools"] as ProjectKeys[]
        ).map((group) => (
          <div
            key={group}
            className="flex flex-col items-start p-2 rounded-lg shadow-md hover:shadow-lg transition duration-300 text-center justify-between border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:dark:bg-zinc-800/30"
          >
            <h4 className="font-semibold">
              {group
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
              :
            </h4>
            <div className="flex flex-wrap">
              {Array.isArray(project[group]) && project[group].length > 0 ? (
                project[group].map((tag) => (
                  <span key={tag} className="text-primary border  px-2 py-1 m-1    
                  flex flex-col items-start rounded-lg shadow-md hover:shadow-lg transition duration-300 text-left justify-between border-b border-gray-300 bg-gradient-to-b from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:dark:bg-zinc-800/30 
                  ">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-gray-500  text-left">
                  No {group.replace(/([A-Z])/g, " ").toLowerCase()} used for this project.
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

{/* nav */}
      <div className="flex justify-start items-center gap-3 fixed top-12 right-1 border-b border-gray-300
                bg-white dark:border-neutral-800 dark:bg-black-800 dark:from-inherit lg:border dark:bg-black
                z-10 w-[100%] sm:w-[calc(100%-15rem)] p-1">
        <Link href={project.githubLink} passHref>
          <Button
            variant="outline"
            className="relative flex justify-start items-center h-[3.5rem] transition-all gap-2"
          >
            <GithubIcon className="text-primary" />
            <h2 className="hidden md:flex">Source Code</h2>
          </Button>
        </Link>
        <Link href={project.liveLink} passHref>
          <Button
            variant="outline"
            className="relative flex justify-start items-center h-[3.5rem] transition-all gap-2"
          >
            <Globe className="text-primary" />
            <h2 className="hidden md:flex">Live Project</h2>
          </Button>
        </Link>


        {currentUser ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="relative flex justify-start items-center h-[3.5rem] transition-all gap-2"
              onClick={() =>
                handleLikeToggle(
                  project.id,
                  project.likes || 0,
                  project.likedBy || {},
                )
              }
            >
              {project.likedBy?.[currentUser.uid] ? (
                <ThumbsDown />
              ) : (
                <ThumbsUp />
              )}
              <b className="text-primary">
                {formatLikes(project.likes)}
              </b>
            </Button>
            <Button
              variant="outline"
              className="relative flex justify-start items-center h-[3.5rem] transition-all gap-2"
              onClick={() => setOpenDialog(project.id)}
            >
              <MessageCircle />
              <b className="text-primary">
                {project.comments?.length || 0}
              </b>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/pages/auth/register" className="relative">
              <Button
                variant="outline"
                className="relative flex justify-start items-center h-[3.5rem] transition-all gap-2"
              >
                <ThumbsUp />
                <b className="text-primary">
                  {formatLikes(project.likes)}
                </b>
              </Button>
            </Link>
            <Link href="/pages/auth/register" className="relative">
              <Button
                variant="outline"
                className="relative flex justify-start items-center h-[3.5rem] transition-all gap-2"
              >
                <MessageCircle />
                <b className="text-primary">
                  {project.comments?.length || 0}
                </b>
              </Button>
            </Link>
          </div>
        )}


      </div>
      {/* Comments */}
      <div className="flex flex-col gap-6  ">

        <h1 className="text-3xl font-semibold mt-10">Comments [<b className="text-primary">{project.comments?.length || 0}</b>]</h1>

        {project.comments && project.comments.length > 0 ? (
          // Sort comments by timestamp in descending order
          project.comments
            .sort((a, b) => b.timestamp - a.timestamp) // b.timestamp - a.timestamp for latest on top
            .map((comment) => (
              <div
                key={comment.id}
                className="flex flex-col gap-6 rounded-lg shadow-sm hover:shadow-lg transition duration-300 p-1
                              justify-start items-start border-b border-gray-300 bg-gradient-to-b
                              from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30
                              dark:from-inherit lg:rounded-xl lg:border lg:bg-gray-200 lg:dark:bg-zinc-800/30
                              w-full"
              >
                <div className=" flex w-full gap-2 justify-between items-center border-b border-gray-300 pb-1">
                  <div className="flex justify-center items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={comment.imageUrl}
                        alt={comment.name || "User Avatar"}
                      />
                    </Avatar>
                    <small className="font-semibold">
                      {comment.name}
                    </small>
                  </div>

                  <Link href={`mailto:${comment.email}`}>
                    <Button>
                      <Mail />
                    </Button>
                  </Link>

                </div>

                <div>

                  <div className="rounded-lg shadow-sm hover:shadow-lg transition duration-300 p-2
                              justify-start items-start border-b border-gray-300 bg-gradient-to-b
                              from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30
                              dark:from-inherit lg:rounded-md lg:border lg:bg-gray-200 lg:dark:bg-zinc-800/30 w-full mb-5 ">{comment.text}</div>

                  <small className="text-primary p-2 border-t border-gray-300 w-full">
                    {new Date(comment.timestamp).toLocaleString()}
                  </small>
                </div>
              </div>
            ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
      {/*  */}
      <Dialog
        open={openDialog === project.id}
        onOpenChange={() => setOpenDialog(null)}
      >
        <DialogContent >
          <VisuallyHidden>
            <DialogTitle>
              Comments for {project.projectName}
            </DialogTitle>
          </VisuallyHidden>

          {/* Comment Input */}
          <div className=" flex gap-2 mt-5">

            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
            />

            <Button onClick={() => handleAddComment(project.id)}>
              <Send /> Send
            </Button>
          </div>


        </DialogContent>
      </Dialog>
      {/*  */}
    </div>
  );
};

export default ProjectDetails;
