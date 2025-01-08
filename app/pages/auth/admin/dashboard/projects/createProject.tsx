/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { ref, push, onValue, update, remove } from "firebase/database";
import Image from "next/image"; // Use the Next.js Image component
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"; // Import Shadcn dialog components
import { database } from "@/firebase/firebase";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
// Define types for Project and Comment
interface Comment {
  imageUrl: string | undefined;
  name: string;
  email: any;
  userId: string;
  text: string;
  timestamp: number;
  userImageUrl: string;
  userName: string;
  userEmail: string;
}

interface Project {
  id: string;
  projectName: string;
  imageUrl?: string;
  descriptionSummary: string;
  description: string;
  githubLink: string;
  liveLink: string;
  generalTools: string[];
  frontendTools: string[];
  backendTools: string[];
  researchTools: string[];
  deploymentTools: string[];
  likes: number;
  comments: Comment[];
}



const CreateProjects = () => {
  const [projectData, setProjectData] = useState<Project>({
    id: "",
    projectName: "",
    imageUrl: "",
    descriptionSummary: "",
    description: "",
    githubLink: "",
    liveLink: "",
    generalTools: [],
    frontendTools: [],
    backendTools: [],
    researchTools: [],
    deploymentTools: [],
    likes: 0,
    comments: [],
  });


  const [projects, setProjects] = useState<Project[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [selectedToolGroup, setSelectedToolGroup] = useState<
    | "generalTools"
    | "frontendTools"
    | "backendTools"
    | "researchTools"
    | "deploymentTools"
  >("generalTools");

  const [editMode, setEditMode] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const projectsRef = ref(database, "MyProjects");
    onValue(projectsRef, (snapshot) => {
      const data = snapshot.val();

      const loadedProjects: Project[] = data
        ? Object.keys(data).map((key) => ({
          id: key, ...data[key],

          comments: data[key].comments
            ? Object.keys(data[key].comments).map((commentKey) => ({
              id: commentKey,
              ...data[key].comments[commentKey],
            }))
            : [],
        }))
        : [];
      setProjects(loadedProjects);
    });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setProjectData({ ...projectData, [name]: value });
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProjectData({ ...projectData, imageUrl: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const projectsRef = ref(database, "MyProjects");

      if (editMode) {
        // Update existing project
        await update(
          ref(database, `MyProjects/${currentProjectId}`),
          projectData,
        );
      } else {
        // Create new project with a unique ID
        const newProjectRef = push(projectsRef); // Generate a unique key
        const newProjectId = newProjectRef.key; // Get the generated key
        const updatedProjectData = { ...projectData, id: newProjectId }; // Add the project ID
        await update(newProjectRef, updatedProjectData); // Set data with the new ID
      }

      resetForm();
    } catch (error) {
      console.error("Error adding/updating project:", error);
      setNotification("Failed to add/update project.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setProjectData({
      id: "",
      projectName: "",
      imageUrl: "",
      descriptionSummary: "",
      description: "",
      githubLink: "",
      liveLink: "",
      generalTools: [],
      frontendTools: [],
      backendTools: [],
      researchTools: [],
      deploymentTools: [],
      likes: 0, // Initialize likes to 0
      comments: [], // Initialize comments as an empty array
    });
    setImageFile(null);
    setIsDialogOpen(false);
    setEditMode(false);
    setCurrentProjectId(null);
  };

  const addTag = () => {
    if (tagInput && !projectData[selectedToolGroup].includes(tagInput)) {
      setProjectData((prevData) => ({
        ...prevData,
        [selectedToolGroup]: [...prevData[selectedToolGroup], tagInput],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setProjectData((prevData) => ({
      ...prevData,
      [selectedToolGroup]: prevData[selectedToolGroup].filter(
        (tag) => tag !== tagToRemove,
      ),
    }));
  };

  const openEditDialog = (project: Project) => {
    setProjectData(project);
    setCurrentProjectId(project.id);
    setIsDialogOpen(true);
    setEditMode(true);
  };
  const openDeleteDialog = (projectId: string) => {
    setCurrentProjectId(projectId);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (currentProjectId) {
      try {
        await remove(ref(database, `MyProjects/${currentProjectId}`));
        setNotification("Project deleted successfully.");
      } catch (error) {
        console.error("Error deleting project:", error);
        setNotification("Failed to delete project.");
      } finally {
        setIsDeleteDialogOpen(false);
        setCurrentProjectId(null);
      }
    }
  };

  const handleToolGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedToolGroup(
      e.target.value as
      | "generalTools"
      | "frontendTools"
      | "backendTools"
      | "researchTools"
      | "deploymentTools",
    );
  };
  // ================================> Delete comments
  const handleDeleteComment = async (projectId: string, commentIndex: number) => {
    try {
      const project = projects.find((proj) => proj.id === projectId);
      if (!project) return;

      const updatedComments = [...project.comments];
      updatedComments.splice(commentIndex, 1);

      await update(ref(database, `MyProjects/${projectId}`), {
        comments: updatedComments,
      });

      setNotification("Comment deleted successfully.");
    } catch (error) {
      console.error("Error deleting comment:", error);
      setNotification("Failed to delete comment.");
    }
  };
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">My Projects</h1>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add New Project</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>
            {editMode ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image URL Input */}
            <div className="relative flex justify-between items-center flex-col">
              <label htmlFor="imageUrl" className="block font-medium">
                Project Image URL
              </label>
              <div className="flex gap-2 justify-center items-center w-full">

              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={projectData.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Enter image URL"
                className="w-full p-2 border border-gray-300 rounded"
              />
              {projectData.imageUrl && (
                <Image
                  src={projectData.imageUrl}
                  alt="Project"
                  width={185}
                  height={185}
                  className="rounded-sm w-7 h-7 object-cover "
                />
              )}
              </div>
            </div>

            {/* Other form inputs */}
            <input
              name="projectName"
              value={projectData.projectName}
              onChange={handleChange}
              placeholder="Project Name"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <textarea
              name="descriptionSummary"
              value={projectData.descriptionSummary}
              onChange={handleChange}
              placeholder="Description Summary"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <textarea
              name="description"
              value={projectData.description}
              onChange={handleChange}
              placeholder="Detailed Description"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              name="githubLink"
              value={projectData.githubLink}
              onChange={handleChange}
              placeholder="GitHub Link"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              name="liveLink"
              value={projectData.liveLink}
              onChange={handleChange}
              placeholder="Live Project Link"
              className="w-full p-2 border border-gray-300 rounded"
            />

            {/* Tool Group Selection */}
            <div className="flex space-x-2">
              <select
                value={selectedToolGroup}
                onChange={handleToolGroupChange}
                className="flex-grow p-2 border border-gray-300 rounded"
              >
                <option value="generalTools">General Tools</option>
                <option value="frontendTools">Frontend Tools</option>
                <option value="backendTools">Backend Tools</option>
                <option value="researchTools">Research Tools</option>
                <option value="deploymentTools">Deployment Tools</option>
              </select>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add Tag"
                className="flex-grow p-2 border border-gray-300 rounded"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>

            {/* Tags Display */}
            <div className="mt-4">
              <h2 className="font-medium">Tags:</h2>
              <div className="flex flex-wrap">
                <div className="mt-4">
                  <h2 className="font-medium">Tags:</h2>
                  <div className="flex flex-wrap">
                    {Array.isArray(projectData[selectedToolGroup]) ? (
                      projectData[selectedToolGroup].map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-500 text-white rounded-full px-3 py-1 m-1 flex items-center justify-between"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-red-500"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No tags available for this group.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit"}
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </form>
        </DialogContent>
      </Dialog>

      {notification && <p className="text-red-500">{notification}</p>}

      <div className="mt-6">
        <h2 className="text-lg font-bold">Existing Projects</h2>
        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="border p-4 mb-4 rounded">
              <h3 className="font-bold">
                Project Name:{" "}
                <b className="text-primary">{project.projectName}</b>
              </h3>
              {project.imageUrl && (
                <Image
                  src={project.imageUrl}
                  alt="Project Image"
                  width={200}
                  height={200}
                  className="rounded-md mb-2"
                />
              )}
              <p>
                Description Summary:{" "}
                <b className="text-primary">{project.descriptionSummary}</b>
              </p>
              <p>
                Description:{" "}
                <b className="text-primary">{project.description}</b>
              </p>
              <p>
                GitHub Link:{" "}
                <b className="text-primary">{project.githubLink}</b>
              </p>
              <p>
                Live Link: <b className="text-primary">{project.liveLink}</b>
              </p>

              <p>
                Likes: <b className="text-primary">{project.likes}</b>
              </p>

              <p>
                Comments:{" "}
                <b className="text-primary">{project.comments.length}</b>
              </p>

              {/* Comments Section */}
              <div className="mt-4">
                <h4 className="font-semibold">Comments</h4>
                {project.comments.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {project.comments.map((comment, index) => (
                      <li key={index} className="flex flex-col gap-6 rounded-lg shadow-sm hover:shadow-lg transition duration-300 p-1
                      justify-start items-start border-b border-gray-300 bg-gradient-to-b
                      from-zinc-200 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30
                      dark:from-inherit lg:rounded-xl lg:border lg:bg-gray-200 lg:dark:bg-zinc-800/30
                      w-full">
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
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleDeleteComment(project.id, index)
                          }
                        >
                          Delete
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No comments yet.</p>
                )}
              </div>

              {/* Tags Display by Group */}
              <div className="mt-4">
                <h4 className="font-semibold">General Tools:</h4>
                <div className="flex flex-wrap">
                  {Array.isArray(project.generalTools) &&
                    project.generalTools.length > 0 ? (
                    project.generalTools.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-500 text-white rounded-full px-2 py-1 m-1"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      No additional tools were used for this project.
                    </span>
                  )}
                </div>

                <h4 className="font-semibold">Frontend Tools:</h4>
                <div className="flex flex-wrap">
                  {Array.isArray(project.frontendTools) &&
                    project.frontendTools.length > 0 ? (
                    project.frontendTools.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-500 text-white rounded-full px-2 py-1 m-1"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      No Frontend tools were used for this project.
                    </span>
                  )}
                </div>

                <h4 className="font-semibold">Backend Tools:</h4>
                <div className="flex flex-wrap">
                  {Array.isArray(project.backendTools) &&
                    project.backendTools.length > 0 ? (
                    project.backendTools.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-500 text-white rounded-full px-2 py-1 m-1"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      No Backend tools were used for this project.
                    </span>
                  )}
                </div>

                <h4 className="font-semibold">Research Tools:</h4>
                <div className="flex flex-wrap">
                  {Array.isArray(project.researchTools) &&
                    project.researchTools.length > 0 ? (
                    project.researchTools.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-500 text-white rounded-full px-2 py-1 m-1"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      No Research tools were used for this project.
                    </span>
                  )}
                </div>

                <h4 className="font-semibold">Deployment Tools:</h4>
                <div className="flex flex-wrap">
                  {Array.isArray(project.deploymentTools) &&
                    project.deploymentTools.length > 0 ? (
                    project.deploymentTools.map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-500 text-white rounded-full px-2 py-1 m-1"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">
                      No Deployment tools were used for this project.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 mt-2">
                <Button
                  onClick={() => openEditDialog(project)}
                  variant="outline"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => openDeleteDialog(project.id)}
                  variant="outline"
                  className="bg-red-500 text-white hover:bg-red-700 border border-red-700 transition
                    duration-300"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent >
          <DialogTitle>Delete Project</DialogTitle>
          <p>Are you sure you want to delete this project?</p>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-500 text-white hover:bg-red-700 border border-red-700 transition
                duration-300"
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateProjects;