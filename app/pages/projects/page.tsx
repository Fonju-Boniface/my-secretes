"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue, update, push } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { database } from "@/firebase/firebase";
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Mail } from "lucide-react";
import CreateProjects from "../auth/admin/dashboard/projects/createProject";
import {
  Dialog,
  DialogContent,
  DialogTitle,

  //   DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Project = {
  id: string;
  userId: string;
  projectName: string;
  imageUrl?: string;
  descriptionSummary: string;
  liveLink: string;
  githubLink: string;
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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    const projectsRef = ref(database, "MyProjects");
    const unsubscribeDatabase = onValue(
      projectsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (data) {
          const loadedProjects: Project[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            comments: data[key].comments
              ? Object.keys(data[key].comments).map((commentKey) => ({
                id: commentKey,
                ...data[key].comments[commentKey],
              }))
              : [],
          }));
          setProjects(loadedProjects);
        } else {
          setProjects([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching projects:", error);
        setError("Failed to load projects.");
        setLoading(false);
      },
    );

    return () => {
      unsubscribeAuth();
      unsubscribeDatabase();
    };
  }, []);

  const handleLikeToggle = (
    projectId: string,
    currentLikes: number,
    likedBy: Record<string, boolean>,
  ) => {
    if (!currentUser) {
      alert("You must be signed in to like or unlike a project.");
      return;
    }

    const userId = currentUser.uid;
    const projectRef = ref(database, `MyProjects/${projectId}`);
    const currentLikeCount = currentLikes ?? 0;

    if (likedBy[userId]) {
      const updates = {
        likes: Math.max(currentLikeCount - 1, 0),
        [`likedBy/${userId}`]: null,
      };

      update(projectRef, updates).catch((error) => {
        console.error("Failed to unlike project:", error);
        alert("Failed to unlike project. Please try again.");
      });
    } else {
      const updates = {
        likes: currentLikeCount + 1,
        [`likedBy/${userId}`]: true,
      };

      update(projectRef, updates).catch((error) => {
        console.error("Failed to like project:", error);
        alert("Failed to like project. Please try again.");
      });
    }
  };

  const handleAddComment = (projectId: string) => {
    if (!currentUser || !commentText.trim()) return;

    const commentData = {
      userId: currentUser.uid,
      email: currentUser.email || "Unknown User",
      imageUrl: currentUser.photoURL || "/default-avatar.png",
      name: currentUser.displayName || "any",
      text: commentText,
      timestamp: Date.now(),
    };

    const projectRef = ref(database, `MyProjects/${projectId}/comments`);

    push(projectRef, commentData)
      .then(() => {
        setCommentText("");
        setOpenDialog(null); // Close dialog
      })
      .catch((error) => {
        console.error("Failed to add comment:", error);
        alert("Failed to add comment. Please try again.");
      });
  };

  const formatLikes = (likes: number | undefined) => {
    const validLikes = likes ?? 0;
    if (validLikes >= 1000000) return `${(validLikes / 1000000).toFixed(1)}M+`;
    if (validLikes >= 1000) return `${(validLikes / 1000).toFixed(1)}K+`;
    return validLikes.toString();
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="mt-8 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col p-2 rounded-lg shadow-md hover:shadow-lg transition duration-300
                text-center justify-between border-b border-gray-300 lg:border dark:border-neutral-800 bg-gradient-to-b
                from-zinc-200 backdrop-blur-2xl  dark:bg-zinc-800/30
                dark:from-inherit lg:w-auto lg:rounded-xl  lg:bg-gray-200 lg:p-2
                lg:dark:bg-zinc-800/30"
            >
              <div className="flex flex-col w-full justify-start items-center gap-[.5rem]">
                <div className="relative w-full h-auto">
                  {project.imageUrl && (
                    <Image
                      src={project.imageUrl}
                      alt="Project Image"
                      width={300}
                      height={200}
                      className="rounded-md w-full dark:bg-zinc-800/30 h-auto object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0">
                    {currentUser ? (
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          className={`p-1 flex items-center relative border-b border-gray-300 lg:border dark:border-neutral-800  bg-primary w-auto shadow-xl
                            justify-center dark:bg-zinc-900 bg-zinc-100`}
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
                          className={`p-1 flex items-center relative border-b border-gray-300 lg:border dark:border-neutral-800  bg-primary w-auto shadow-xl
                            justify-center dark:bg-zinc-900 bg-zinc-100`}
                          onClick={() => setOpenDialog(project.id)}
                        >
                          <MessageCircle />
                          <b className="text-primary">
                            {project.comments?.length || 0}
                          </b>
                        </Button>
                      </div>
                    ) : (
                      <Link href="/pages/auth/register" className="relative">
                        <Button
                          variant="outline"
                          className={`p-1 flex items-center relative border-b border-gray-300 lg:border dark:border-neutral-800  bg-primary w-auto shadow-xl
                            justify-center dark:bg-zinc-900 bg-zinc-100`}
                        >
                          <ThumbsUp />
                          <b className="text-primary">
                            {formatLikes(project.likes)}
                          </b>
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <h2 className="text-xl font-bold mt-4">
                  {project.projectName}
                </h2>
                <small className="text-sm sm:text-xs mt-2">
                  {project.descriptionSummary}
                </small>
              </div>

              {/* Comments Dialog */}
              {/* Comments Dialog */}

              <Dialog
                open={openDialog === project.id}
                onOpenChange={() => setOpenDialog(null)}
              >
                <DialogContent>
                  <VisuallyHidden>
                    <DialogTitle>
                      Comments for {project.projectName}
                    </DialogTitle>
                  </VisuallyHidden>

                  {/* Comment Input */}
                  <div className=" flex gap-2  mt-5">
{/*  */}
                    <Input
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write your comment..."
                    />

                    <Button onClick={() => handleAddComment(project.id)}>
                      <Send /> Send
                    </Button>
                  </div>

                  {/* Display Comments */}
                  <div className="flex flex-col gap-6 max-h-[50vh] overflow-y-auto ">
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
                </DialogContent>
              </Dialog>

              <div className="flex flex-col w-full justify-center items-center gap-[.1rem]">
                <Link
                  href={`/pages/projects/${project.id}`}
                  target="_blank"
                  className="text-primary mt-4 block font-semibold w-full"
                >
                  <Button
                    variant="outline"
                    className="bg-primary w-full text-secondary flex items-center space-x-2"
                  >
                    View Project
                  </Button>
                </Link>
                <div className="flex w-full justify-center items-center gap-1">
                  <Link
                    href={project.liveLink}
                    className="text-primary mt-4 block font-semibold w-full"
                  >
                    <Button
                      variant="outline"
                      className="bg-primary w-full text-primary-foreground flex items-center space-x-2"
                    >
                      Live Project
                    </Button>
                  </Link>
                  <Link
                    href={project.githubLink}
                    className="text-primary mt-4 block font-semibold w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full text-secondary-foreground flex items-center space-x-2"
                    >
                      Source Code
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <br />
      <CreateProjects />
    </>
  );
};

export default Projects;
