'use client';
import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '@/firebase/firebase'; // Adjust the import to match your Firebase setup
import { Download } from "lucide-react"; // Import the Download icon from lucide-react
import { Button } from "@/components/ui/button"; // Import the Shadcn Button component

const Resume = () => {
  const [resumeLink, setResumeLink] = useState('');
  const db = getDatabase(app);

  useEffect(() => {
    const resumeRef = ref(db, 'resume');
    onValue(resumeRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const latestKey = Object.keys(data).pop() || '';
        if (latestKey && data[latestKey]) {
          setResumeLink(data[latestKey].url);
        }
      }
    });
  }, [db]);
  const handleDownload = async () => {
    if (resumeLink) {
      try {
        const response = await fetch(resumeLink);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download file.');
      }
    }
  };

  return (
    <div className="w-full">
      
      {resumeLink && (
        <Button
        onClick={handleDownload}
        variant="outline"
        className="bg-primary w-full text-primary-foreground flex items-center space-x-2"
        disabled={!resumeLink} // Disable button if no file URL is available
      >
         <Download className="w-5 h-5" />
          <span>Download Resume</span>
        </Button>
      )}
    </div>
  );
};

export default Resume;