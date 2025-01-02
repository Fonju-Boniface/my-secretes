"use client";
import { useState, useEffect } from "react";
import { ref, push } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import PhoneInput, { parsePhoneNumber } from "react-phone-number-input"; 
import "react-phone-number-input/style.css"; 
import { Button } from "@/components/ui/button";
import { database } from "@/firebase/firebase";
import { useTheme } from "next-themes"; 
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input"; 
import Image from "next/image";

const ContactForm = () => {
  const { toast } = useToast(); 
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    message: "",
    photoURL: "https://cdn.sanity.io/images/7utzqmtq/production/1663912a9831a8ee3e58747113b25bbd61598b95-1898x971.png",
  });
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    message: false,
    photoURL: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState("");

  const { theme } = useTheme();

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

  const handlePhoneChange = (value?: string) => {
    if (value) {
      try {
        // Parse the phone number and extract country name
        const phoneNumber = parsePhoneNumber(value);
        const country = phoneNumber?.country || ""; // Get the country name from the phone number

        setFormData((data) => ({
          ...data,
          phone: value,
          country, // Set country field to the country name
        }));
        setFormErrors((errors) => ({ ...errors, phone: !value }));
      } catch (error) {
        console.error("Error parsing phone number:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = {
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      email: !formData.email || !isValidEmail(formData.email),
      phone: !formData.phone,
      message: !formData.message,
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
      const contactRef = ref(database, "contacts");
      await push(contactRef, data);

      toast({
        title: "Contact successfully sent",
        description: "Form submitted successfully!",
        variant: "default",
      });
      setNotification("Form submitted successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
        message: "",
        photoURL: "https://cdn.sanity.io/images/7utzqmtq/production/1663912a9831a8ee3e58747113b25bbd61598b95-1898x971.png",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      console.error("Error submitting form:", errorMessage);
      setNotification("Failed to submit form. Please try again later.");

      toast({
        title: "Submission Error",
        description: "Failed to submit form. Please try again later.",
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
    <div className="w-full flex flex-col justify-center min-h-[calc(100vh-4rem)]  items-center p-1">
      <h2 className="text-3xl font-bold mb-6">Contact Me</h2>
      <form onSubmit={handleSubmit} className="w-full sm:w-auto space-y-2">
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
              className={`p-2 py-4 ${formErrors.firstName ? "border-red-500" : "border-gray-300"}`}
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
              className={`p-2 py-4 ${formErrors.lastName ? "border-red-500" : "border-gray-300"}`}
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
              className={`p-2 py-4 ${formErrors.email ? "border-red-500" : "border-gray-300"}`}
              placeholder="Enter your email"
              disabled={isAuthenticated}
            />
            {formErrors.email && <small className="text-red-500">Please enter a valid email address</small>}
          </div>
        </div>

        <div className="flex-col">
          <label htmlFor="country" className="font-semibold text-sm mb-1">
            Country
          </label>
          <Input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            className="p-2 py-4 border-gray-300"
            placeholder="Country will auto-fill based on phone number"
            disabled
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <PhoneInput
            country={formData.country || "cm"}  // Default to Cameroon if no country is set
            value={formData.phone}
            onChange={handlePhoneChange}
            inputClass={`!w-full !bg-transparent !border-gray-300 ${theme === "dark" ? "text-white" : "text-black"}`}
            dropdownClass={`${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
          />
          {formErrors.phone && <small className="text-red-500">Phone is required</small>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="message" className="font-semibold text-sm mb-1">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className={`p-2 py-4 border-b border-gray-300`}
            placeholder="Type your message"
            required
          />
          {formErrors.message && <small className="text-red-500">Message is required</small>}
        </div>

        <div className="flex justify-center">
          <Button type="submit" variant={"outline"} disabled={submitting} className="w-full mt-4">
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>

      {notification && <p className="mt-4 text-green-500">{notification}</p>}
    </div>
  );
};

export default ContactForm;
