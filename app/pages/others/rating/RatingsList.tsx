/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { app } from '@/firebase/firebase';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

import { ref, onValue, remove, getDatabase, get } from "firebase/database";
import { database } from "@/firebase/firebase";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"
import * as ReactRating from "react-rating";
import { Mail } from 'lucide-react';
import Link from 'next/link';

const RatingsList = () => {
  const [ratings, setRatings] = useState<any[]>([]);
  const { toast } = useToast();
  const auth = getAuth(app);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null); // State for the user's role
  const [loading, setLoading] = useState<boolean>(true); // Loading state to track role fetching
  const [deleting, setDeleting] = useState<string | null>(null);

  const Rating = ReactRating.default as unknown as React.ComponentType<any>;

  useEffect(() => {
    // Fetch the ratings data from the Realtime Database
    const ratingsRef = ref(database, "Ratings");
    const unsubscribe = onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedRatings = Object.entries(data).map(([id, value]) => {
          if (typeof value === "object" && value !== null) {
            return {
              id,
              ...value,
            } as { id: string;[key: string]: any };
          }
          return { id };
        });
        setRatings(formattedRatings);
      } else {
        setRatings([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Fetch user role from Realtime Database if the user is authenticated
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.uid}/role`);

        setLoading(true); // Set loading to true when fetching role

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              setRole(snapshot.val()); // Set the role from Realtime Database
            } else {
              setRole('user'); // Default role if not found
            }
          })
          .catch((error) => {
            console.error('Error fetching role:', error);
            setRole('user'); // Fallback role in case of error
          })
          .finally(() => {
            setLoading(false); // Set loading to false once role is fetched
          });
      } else {
        setUser(null); // Reset user to null when logged out
        setRole(null); // Reset role when logged out
        router.push('/'); // Redirect to the login page if user is logged out
      }
    });

    return () => unsubscribe(); // Clean up subscription on component unmount
  }, [auth, router]);


  const handleDelete = async (ratingId: string) => {
    setDeleting(ratingId);
    try {
      const ratingRef = ref(database, `Ratings/${ratingId}`);
      await remove(ratingRef);
      toast({
        title: "Deleted",
        description: "Rating deleted successfully.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the rating.",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  )

  if (loading) {
    return <p className="text-center">Loading ratings...</p>;
  }

  if (ratings.length === 0) {
    return <p className="text-center">No ratings available.</p>;
  }
  // Show message if the user is not logged in
  if (!user) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="w-full flex flex-col justify-center items-center">
      <small className="text-sm font-bold mb-6">{ratings.length} {ratings.length > 1 ? "people" : "person"} have Rate and reviewed my work</small>

      {/* Carousel to Display Ratings */}
      <Carousel plugins={[plugin.current]}
        className="w-full max-w-xs"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
      //  className="w-full max-w-sm mt-10"
      >
        <CarouselContent className="-ml-1">

          {ratings.map((rating) => (
            <CarouselItem key={rating.id}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-between flex-col p-6" >
                    <Image src={rating.photoURL} alt="Profile Image" width={50} height={50} className=' rounded-full p-2 border-primary border' />
                    <h3 className="font-bold text-lg">{`${rating.firstName} ${rating.lastName}`}</h3>
                    <p className="text-sm text-center mt-3">
                      {rating.message}
                      
                    </p>
                    <div className="flex gap-1">
                      <Rating
                        initialRating={rating.rating}
                        readonly
                        emptySymbol="fa fa-star text-gray-400"
                        fullSymbol="fa fa-star text-yellow-500"
                      />
                      {/* <span>{rating.rating} stars</span> */}
                    </div>

                    <div className="flex justify-center items-center gap-2 w-full mt-4 ">

                      {role === "admin" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                              Delete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <p>Are you sure you want to delete this rating?</p>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => handleDelete(rating.id)}
                                disabled={deleting === rating.id}
                              >
                                {deleting === rating.id ? "Deleting..." : "Confirm"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                      <Button variant="outline" className="w-full">
                        <Link href={`mailto:${rating.email}`}>
                        <Mail />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* <p>Role: {role || "No role assigned"}</p> */}
    </div>
  );
};

export default RatingsList;
