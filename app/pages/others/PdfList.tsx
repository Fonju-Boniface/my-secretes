"use client";

import React, { useEffect, useState } from "react";
 // Adjust the path based on your project structure
import { Button } from "@/components/ui/button";
import { sanityClient } from "@/sanity";

type PDFFile = {
  _id: string;
  title: string;
  file: {
    asset: {
      _ref: string;
      url: string;
    };
  };
};

const RealtimePDFList = () => {
  const [pdfFiles, setPDFFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPDFs = async () => {
    try {
      const query = `*[_type == "pdfFile"]{
        _id,
        title,
        "file": file.asset->url
      }`;
      const data = await sanityClient.fetch(query);
      setPDFFiles(data);
    } catch (error) {
      console.error("Error fetching PDF files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPDFs(); // Initial fetch

    const subscription = sanityClient.listen('*[_type == "pdfFile"]').subscribe(() => {
      fetchPDFs(); // Re-fetch on updates
    });

    return () => subscription.unsubscribe(); // Clean up on unmount
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Real-Time PDF Files</h1>
      {loading ? (
        <p className="text-gray-500">Loading PDFs...</p>
      ) : pdfFiles.length === 0 ? (
        <p className="text-gray-500">No PDFs available.</p>
      ) : (
        <ul className="space-y-4">
          {pdfFiles.map((pdf) => (
            <li key={pdf._id} className="flex items-center justify-between p-4 bg-gray-100 rounded-md">
              <div>
                <h2 className="text-lg font-medium">{pdf.title}</h2>
                <a href={pdf.file} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  Download PDF
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Button onClick={fetchPDFs} className="mt-4">
        Refresh
      </Button>
    </div>
  );
};

export default RealtimePDFList;
