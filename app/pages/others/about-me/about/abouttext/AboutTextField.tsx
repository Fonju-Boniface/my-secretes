"use client";

import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/firebase/firebase';
import AboutText from './page'; // Ensure the path is correct for your project

const AboutTextField = () => {
    const [text, setText] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const textRef = ref(database, 'your-about-text');

        // Listen for changes to the database
        const unsubscribe = onValue(textRef, (snapshot) => {
            const snapshotData = snapshot.val();
            setText(snapshotData || '');
            setLoading(false); // Stop loading when data is retrieved
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    return (
        <div className="mt-4 text-start">
            {loading ? (
                <p className="text-center text-gray-500">Loading...</p>
            ) : (
                <div className="text-2xl sm:text-base md:text-lg lg:text-xl text-start">{text}</div>
            )}
            <br />
            <AboutText />

            
        </div>
    );
};

export default AboutTextField;
