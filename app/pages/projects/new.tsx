"use client";

import React, { useEffect, useState } from "react";
import { ref, onValue, push } from "firebase/database";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { database } from "@/firebase/firebase";
import { Send } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// Define a type for the project data
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
              className="flex flex-col p-2 rounded-lg shadow-md"
            >
              {/* Project Details */}
              <Image
                src={project.imageUrl || ""}
                alt="Project Image"
                width={300}
                height={200}
                className="rounded-md"
              />
              <h2>{project.projectName}</h2>
              <p>{project.descriptionSummary}</p>

              {/* Actions */}
              <Button onClick={() => setOpenDialog(project.id)}>
                View Comments
              </Button>

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
                  <Input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your comment..."
                  />

                  <Button onClick={() => handleAddComment(project.id)}>
                    <Send /> Send
                  </Button>

                  {/* Display Comments */}
                  <div>
                    {project.comments && project.comments.length > 0 ? (
                      // Sort comments by timestamp in descending order
                      project.comments
                        .sort((a, b) => b.timestamp - a.timestamp) // b.timestamp - a.timestamp for latest on top
                        .map((comment) => (
                          <div
                            key={comment.id}
                            className="flex items-start gap-2 mt-2"
                          >
                            <Avatar>
                              <AvatarImage
                                src={comment.imageUrl}
                                alt="User Avatar"
                              />
                              <AvatarFallback>
                                {comment.email?.[0]?.toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>

                            <div>
                              <p className="font-semibold">{comment.email}</p>
                              <p className="font-semibold">{comment.name}</p>
                              <p className="text-sm">{comment.text}</p>
                              <small>
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
            </div>
          ))
        )}
      </div>

      {/* Display Authenticated User Info */}
      {currentUser && (
        <div className="flex items-center gap-4 mt-4">
          <Image
            src={currentUser.photoURL || "/default-avatar.png"}
            alt="User Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <p className="font-bold">{currentUser.displayName || "User"}</p>
            <p className="text-sm text-gray-600">{currentUser.email}</p>
            <p className="text-sm text-gray-600">{currentUser.displayName}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Projects;
