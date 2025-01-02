/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { Loader2, CheckCircle, XCircle, Dock } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
// import { useToast } from "@/components/hooks/use-toast"; // Updated import path for your custom toast hook

interface FileDetails {
  name: string;
  type: string;
  size: string;
  length?: string; // For audio/video duration
  resolution?: string; // For images/videos
  preview?: string; // File preview URL
  file: File; // Original file for downloads
}

const FileDropzone: React.FC = () => {
  const { toast } = useToast(); // Accessing the toast function
  const [files, setFiles] = useState<FileDetails[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setUploading(true);
      setMessage(null);

      try {
        const newFiles: FileDetails[] = [];
        for (const file of acceptedFiles) {
          const isDuplicate = files.some((existingFile) => existingFile.name === file.name);

          if (isDuplicate) {
            toast({
              description: `The file "${file.name}" has already been uploaded.`,
            });
            continue;
          }

          const fileDetails: FileDetails = {
            name: file.name,
            type: file.type,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            preview: URL.createObjectURL(file),
            file,
          };

          if (file.type.startsWith("image/")) {
            const image = new window.Image();
            if (fileDetails.preview) { // Ensure preview is defined
              await new Promise<void>((resolve) => {
                image.onload = () => {
                  fileDetails.resolution = `${image.width}x${image.height}`;
                  resolve();
                };
                image.src = fileDetails.preview;
              });
            } else {
              console.error(`No preview available for image ${file.name}`);
            }
          }

          if (file.type.startsWith("video/")) {
            const media = document.createElement("video");
            if (fileDetails.preview) { // Ensure preview is defined
              await new Promise<void>((resolve) => {
                media.onloadedmetadata = () => {
                  fileDetails.length = `${Math.floor(media.duration)} seconds`;
                  fileDetails.resolution = `${media.videoWidth}x${media.videoHeight}`;
                  resolve();
                };
                media.src = fileDetails.preview;
              });
            } else {
              console.error(`No preview available for video ${file.name}`);
            }
          } else if (file.type.startsWith("audio/")) {
            const media = document.createElement("audio");
            if (fileDetails.preview) { // Ensure preview is defined
              await new Promise<void>((resolve) => {
                media.onloadedmetadata = () => {
                  fileDetails.length = `${Math.floor(media.duration)} seconds`;
                  resolve();
                };
                media.src = fileDetails.preview;
              });
            } else {
              console.error(`No preview available for audio ${file.name}`);
            }
          }



          newFiles.push(fileDetails);
        }

        if (newFiles.length > 0) {
          setFiles((prevFiles) => [...prevFiles, ...newFiles]);
          toast({
            description: "Files uploaded successfully!",
          });
        }
      } catch (error) {
        console.error("File processing error:", error);
        toast({
          description: "An error occurred while uploading files.",
        });
      } finally {
        setUploading(false);
      }
    },
    [files, toast]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
      "audio/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
    },
  });

  const handleRemoveFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
    toast({
      description: `The file "${name}" has been removed.`,
    });
  };

  const handleDownloadFile = (file: File) => {
    const fileReader = new FileReader();

    fileReader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        toast({
          description: `Downloading... ${progress}%`,
          duration: 2000, // Show progress briefly
        });
      }
    };

    fileReader.onloadend = () => {
      saveAs(file, file.name);
      toast({
        description: "File downloaded successfully!",
        duration: 5000, // Set duration for success message after download
      });
    };

    fileReader.readAsArrayBuffer(file); // Read the file
  };


  const handleDownloadAll = async () => {


    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file.file);
    });

    zip.generateAsync({ type: "blob" }, (metadata) => {
      const progress = Math.round((metadata.percent || 0));
      toast({
        description: `Progress: ${progress}%`,
        duration: 2000, // Show progress briefly
      });
    }).then((content) => {
      saveAs(content, "all-files.zip");
      toast({
        description: "All files downloaded successfully!",
        duration: 5000,
      });
    }).catch(() => {
      toast({
        description: "Error occurred while downloading.",
        duration: 5000,
      });
    });
  };


  return (
    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg ">
      <div
        {...getRootProps()}
        className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 sticky top-0 z-10 bg-white"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500">Drag and drop your files here, or click to browse</p>
      </div>

      {uploading && (
        <div className="flex items-center mt-4 space-x-2 text-blue-500">
          <Loader2 className="animate-spin" />
          <p>Uploading files...</p>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center mt-4 space-x-2 ${message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
        >
          {message.type === "success" ? <CheckCircle /> : <XCircle />}
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mt-4">
        {files.map((file, index) => (
          <div
            key={index}
            className="relative flex flex-col p-2 border rounded-lg shadow-sm bg-gray-50"
          >
            {file.preview && typeof file.preview === 'string' && file.type.startsWith("image/") && (
              <Image
                src={file.preview}
                alt={file.name}
                width={150}
                height={150}
                className="object-contain w-auto h-80 rounded"
              />
            )}

            {file.preview && typeof file.preview === 'string' && file.type.startsWith("video/") && (
              <video src={file.preview} controls className="object-cover w-auto h-80 rounded" />
            )}

            {file.preview && typeof file.preview === 'string' && file.type.startsWith("audio/") && (
              <audio src={file.preview} controls className="w-full mt-2" />
            )}

            {file.type === "application/pdf" && (
              <div className="flex flex-col justify-center items-center gap-1">
                <Dock />
                <a
                  href={file.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mt-2"
                >
                  Review PDF
                </a>
              </div>
            )}
            {/* <div className="mt-2 text-sm flex flex-col justify-center items-center gap-1">
              <p><strong>Name:</strong> {file.name}</p>
              <p><strong>Type:</strong> {file.type}</p>
              <p><strong>Size:</strong> {file.size}</p>
              {file.resolution && <p><strong>Resolution:</strong> {file.resolution}</p>}
              {file.length && <p><strong>Length:</strong> {file.length}</p>}
            </div> */}

            <div className="mt-2 text-sm flex flex-col justify-center items-center gap-1">
              <p><strong>Name:</strong> {file.name}</p>
              <p><strong>Type:</strong> {file.type}</p>
              <p><strong>Size:</strong> {file.size}</p>
              <p><strong>Resolution:</strong> {file.resolution || "N/A"}</p>
              <p><strong>Length:</strong> {file.length || "N/A"}</p>
            </div>
            <div className="flex mt-2 space-x-2">
              <Button
                className="text-blue-500 w-full"
                onClick={() => handleDownloadFile(file.file)}
              >
                Download
              </Button>
              <Button
                className="text-red-500 w-full"
                onClick={() => handleRemoveFile(file.name)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      {files.length > 0 && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleDownloadAll}
        >
          Download All
        </button>
      )}
    </div>
  );
};

export default FileDropzone;
