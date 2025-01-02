"use client";

import React from "react";
import { Download } from "lucide-react"; // Import the Download icon from lucide-react
import { Button } from "@/components/ui/button"; // Import the Shadcn Button component

const DownResume: React.FC = () => {
  // Static file path for the resume
  const fileUrl = "/public/res 1.pdf"; // Replace with your local file path

  const handleDownload = () => {
    if (fileUrl) {
      // Create a link element
      const link = document.createElement("a");
      link.href = fileUrl; // Use the local file path
      link.download = "resume.pdf"; // Specify the file name for download
      link.target = "_blank"; // Open in a new tab, but with download
      link.rel = "noopener noreferrer"; // Security: prevent reverse tab-napping
      link.click(); // Trigger the download
    } else {
      alert("Resume not available for download.");
    }
  };

  return (
    <div className="w-full">
      <Button
        onClick={handleDownload}
        variant="outline"
        className="bg-primary w-full text-primary-foreground flex items-center space-x-2"
        disabled={!fileUrl} // Disable button if no file URL is available
      >
        <Download className="w-5 h-5" />
        <span>Download Resume</span>
      </Button>
    </div>
  );
};

export default DownResume;
