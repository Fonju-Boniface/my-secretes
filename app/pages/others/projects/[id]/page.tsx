
'use client';
import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GithubIcon, Globe } from "lucide-react";
import { useRouter } from "next/router";
import { database } from "@/firebase/firebase";

type Project = {
  id: string;
  projectName: string;
  imageUrl?: string;
  descriptionSummary: string;
  description: string;
  githubLink?: string;
  liveLink?: string;
  generalTools?: string[];
  frontendTools?: string[];
  backendTools?: string[];
  researchTools?: string[];
  deploymentTools?: string[];
};

const ProjectDetails = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      const projectRef = ref(database, `MyProjects/${id}`);
      const unsubscribe = onValue(
        projectRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setProject({ id: id as string, ...data });
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

      return () => unsubscribe();
    }
  }, [id]);

  if (loading) return <p>Loading project details...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  if (!project) return null;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">{project.projectName}</h1>
      {project.imageUrl && (
        <Image
          src={project.imageUrl}
          alt="Project Image"
          width={400}
          height={400}
          className="rounded-sm w-[100%] h-[auto] object-cover"
        />
      )}
      <p>
        Description Summary: <b>{project.descriptionSummary || "No summary provided."}</b>
      </p>
      <p>Description: <b>{project.description || "No description available."}</b></p>

      {/* Tags */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["generalTools", "frontendTools", "backendTools", "researchTools", "deploymentTools"].map(
          (group) => (
            <div key={group}>
              <h4 className="font-semibold">
                {group.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:
              </h4>
              {project[group as keyof Project]?.length ? (
                <div className="flex flex-wrap">
                  {project[group as keyof Project].map((tool) => (
                    <span key={tool} className="bg-primary rounded-md px-2 py-1 m-1">
                      {tool}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No tools listed.</p>
              )}
            </div>
          )
        )}
      </div>

      {/* Links */}
      <div className="mt-6 flex gap-3">
        {project.githubLink && (
          <Link href={project.githubLink}>
            <Button variant="outline">
              <GithubIcon />
              Source Code
            </Button>
          </Link>
        )}
        {project.liveLink && (
          <Link href={project.liveLink}>
            <Button variant="outline">
              <Globe />
              Live Project
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
