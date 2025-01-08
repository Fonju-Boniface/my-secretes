/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { ref, push } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { database } from "@/firebase/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import * as ReactRating from "react-rating";
import RatingsList from "./RatingsList";
import { Card } from "@/components/ui/card";



const RatingForm = () => {
  const Rating = ReactRating.default as unknown as React.ComponentType<any>;
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    rating: 2, // Add rating field
    photoURL: "https://cdn.sanity.io/images/7utzqmtq/production/1663912a9831a8ee3e58747113b25bbd61598b95-1898x971.png",
  });
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    message: false,
    rating: false, // Add rating error
    photoURL: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState("");


  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setFormData((data) => ({
          ...data,
          firstName: user.displayName?.split(" ")[0] || "",
          lastName: user.displayName?.split(" ")[1] || "",
          email: user.email || "",
          photoURL: user.photoURL || "https://cdn.sanity.io/images/7utzqmtq/production/1663912a9831a8ee3e58747113b25bbd61598b95-1898x971.png",
        }));
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((data) => ({ ...data, [name]: value }));
    setFormErrors((errors) => ({ ...errors, [name]: !value }));
  };
  const handleRatingChange = (value: number) => {
    setFormData((data) => ({ ...data, rating: value }));
    setFormErrors((errors) => ({ ...errors, rating: value === 0 }));
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = {
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      email: !formData.email || !isValidEmail(formData.email),
      message: !formData.message,
      rating: formData.rating === 0, // Validate rating
      photoURL: !formData.photoURL,
    };

    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) {
      setNotification("Please fill out all required fields correctly.");
      toast({
        title: "Validation Error",
        description: "Please fill out all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const data = {
      ...formData,
      timestamp: new Date().toISOString(),
    };

    try {
      const contactRef = ref(database, "Ratings");
      await push(contactRef, data);

      toast({
        title: "Review successfully added",
        description: "Form submitted successfully!",
        variant: "default",
      });
      setNotification("Form submitted successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        rating: 0, // Reset rating
        photoURL: "https://cdn.sanity.io/images/7utzqmtq/production/1663912a9831a8ee3e58747113b25bbd61598b95-1898x971.png",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error submitting form:", errorMessage);
      setNotification("Failed to add review. Please try again later.");

      toast({
        title: "Submission Error",
        description: "Failed to add review. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      photoURL: value || "https://cdn.sanity.io/images/7utzqmtq/production/1663912a9831a8ee3e58747113b25bbd61598b95-1898x971.png",
    });
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="w-full gap-16 flex flex-col justify-center  items-center p-1">
      <h2 className="text-3xl font-bold mb-6">Rate and review my work</h2>

      <div className="flex flex-col gap-14   justify-center items-center w-full ">
        <form onSubmit={handleSubmit} className=" w-full lg:w-[500px] space-y-2 h-[60vh] ">
        <Card className="p-2">

          <div className={`${isAuthenticated ? "hidden" : " space-y-2"}`}>
            <div className=" justify-center items-center gap-4  hidden">
              <Input
                type="text"
                value={formData.photoURL}
                onChange={handleImageUrlChange}
                placeholder="Paste Image URL"
              />
              <Image src={formData.photoURL} alt="Profile Image" width={50} height={50} />
            </div>

            <div className="flex flex-col">
              <label htmlFor="firstName" className="font-semibold text-sm mb-1">
                First Name
              </label>
              <Input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`p-2 py-4 ${formErrors.firstName ? "border-red-500" : "border-gray-300"} hover:border-primary`}
                placeholder="Enter your first name"
                disabled={isAuthenticated}
              />
              {formErrors.firstName && <small className="text-red-500">First Name is required</small>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="lastName" className="font-semibold text-sm mb-1">
                Last Name
              </label>
              <Input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`p-2 py-4 ${formErrors.lastName ? "border-red-500" : "border-gray-300"} hover:border-primary`}
                placeholder="Enter your last name"
                disabled={isAuthenticated}
              />
              {formErrors.lastName && <small className="text-red-500">Last Name is required</small>}
            </div>

            <div className="flex flex-col">
              <label htmlFor="email" className="font-semibold text-sm mb-1">
                Email
              </label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`p-2 py-4 ${formErrors.email ? "border-red-500" : "border-gray-300"} hover:border-primary`}
                placeholder="Enter your email"
                disabled={isAuthenticated}
              />
              {formErrors.email && <small className="text-red-500">Please enter a valid email address</small>}
            </div>
          </div>

          <div className="flex flex-col mt-5">
            <label htmlFor="message" className="font-semibold text-sm mb-1">
              Review
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`p-2 py-4 border-b border-gray-300 hover:border-primary resize-none`}
              placeholder="Type your Review"
              required
            />

            {formErrors.message && <small className="text-red-500">Message is required</small>}
          </div>

          {/* Other input fields */}
          <div className="flex flex-col mt-5">
            <label htmlFor="rating" className="font-semibold text-sm mb-1">
              Add Rate
            </label>
            <div className="flex gap-2">
              <Rating
                initialRating={formData.rating}
                onChange={handleRatingChange}
                emptySymbol="fa fa-star text-gray-400"
                fullSymbol="fa fa-star text-yellow-500"
              />
              <b>{formData.rating} stars</b>
            </div>
            {formErrors.rating && <small className="text-red-500">Rating is required</small>}
          </div>


          <div className="flex justify-center mt-5">
            <Button type="submit" variant={"outline"} disabled={submitting} className="w-full mt-4 hover:border-primary">
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </Card>
        </form>

        <RatingsList />
      </div>

      {notification && <p className="mt-4 text-green-500">{notification}</p>}
    </div>
  );
};

export default RatingForm;
