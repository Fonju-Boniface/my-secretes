/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { ref, push } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Button } from "@/components/ui/button";
import { database } from "@/firebase/firebase";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";

type CountryData = {
  name: string;
  dialCode: string;
  countryCode: string; // ISO 3166-1 alpha-2 code
  format: string;
};

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    message: "",
  });
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    message: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  const handlePhoneChange = (value: string, countryData: CountryData) => {
    setFormData((data) => ({
      ...data,
      phone: value,
      country: countryData.name, // Use the full country name
    }));
    setFormErrors((errors) => ({ ...errors, phone: !value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors = {
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      email: !formData.email || !isValidEmail(formData.email),
      phone: !formData.phone,
      message: !formData.message,
    };

    setFormErrors(errors);

    if (Object.values(errors).some((error) => error)) {
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
      setNotification("Form submitted successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "",
        message: "",
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error submitting form:", error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
      setNotification("Failed to submit form. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="max-w-2xl mx-auto p-1 sm:p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-6">Contact Me</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Name */}
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

        {/* Country */}
        <div className="flex flex-col">
          <label htmlFor="country" className="font-semibold text-sm mb-1">
            Country
          </label>
          <Input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="p-2 py-4 border-gray-300"
            placeholder="Select a country"
            disabled // Disable manual editing
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone
          </label>
          <PhoneInput
            country={formData.country || "us"}
            value={formData.phone}
            onChange={handlePhoneChange}
            inputClass={`!w-full !bg-transparent !border-gray-300 ${
              theme === "dark" ? "text-white" : "text-black"
            }`}
            dropdownClass={`${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}
            enableSearch
          />
          {formErrors.phone && <small className="text-red-500">Phone is required</small>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button type="submit" variant="outline" disabled={submitting} className="w-full mt-4">
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>

        {notification && <p className="mt-4 text-green-500">{notification}</p>}
      </form>
    </div>
  );
};

export default ContactForm;
