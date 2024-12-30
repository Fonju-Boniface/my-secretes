"use client";

import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase/firebase';
// import AboutHobby from './page';

const AboutHobbies = () => {
    const [hobbies, setHobbies] = useState<{ [key: string]: { name: string; iconName: string; text: string } }>({});
    const [loading, setLoading] = useState(true); // New loading state

    useEffect(() => {
        const dataRef = ref(database, 'your-Hobbies');
        onValue(dataRef, (snapshot) => {
            const snapshotData = snapshot.val();
            setHobbies(snapshotData || {});
            setLoading(false); // Stop loading when data is fetched
        });
    }, []);

    return (
        <>
           

            {/* Show loading state while fetching data */}
            {loading ? (
                <p className='text-center'>Loading...</p>
            ) : (
                <section className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(hobbies).map(([id, hobby]) => (
                        <div key={id} className="text-center justify-center border-b border-gray-300
                        bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl
                        dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static
                        lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
                            <i className={` ${hobby.iconName} text-primary text-4xl mb-4`}></i>
                            <h3 className="text-xl font-bold">{hobby.name}</h3>
                            
                            
                            <p className="mt-2 text-2xl font-bold sm:text-base">{hobby.text}</p>
                        </div>
                    ))}
                </section>
            )}

           <br />
           {/* <AboutHobby /> */}
        </>
    );
};

export default AboutHobbies;
