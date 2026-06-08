import React, { useState, useEffect } from 'react';
import SphereImageGrid, { ImageData } from "../components/ui/img-sphere";
import { motion } from "motion/react";
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, query, limit, doc, getDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNetwork } from '../lib/network-context';

interface StudentProfile {
  id: string;
  displayName: string;
  bio?: string;
  photoURL?: string;
  batch?: string;
  department?: string;
}

export default function MeetUs() {
  const [user] = useAuthState(auth);
  const [size, setSize] = useState(600);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodeCount, setNodeCount] = useState(130);
  const { networkId } = useNetwork();

  useEffect(() => {
    if (!networkId) return;

    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, 'networks', networkId));
      if (snap.exists() && snap.data().nodeCount) {
        setNodeCount(snap.data().nodeCount);
      }
    };
    fetchConfig();

    const q = query(collection(db, `networks/${networkId}/members`), limit(nodeCount));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as StudentProfile));
      setStudents(data);
      setLoading(false);
    });

    return () => unsub();
  }, [networkId, nodeCount]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        // Use full width with a small safety margin
        setSize(screenWidth - 10); 
      } else if (screenWidth < 1024) {
        setSize(900); 
      } else {
        setSize(1100); 
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Map students to Sphere images, fill the rest up to nodeCount
  const sphereImages: ImageData[] = Array.from({ length: nodeCount }).map((_, i) => {
    const student = students[i];
    if (student) {
      return {
        id: student.id,
        src: student.photoURL || "",
        alt: student.displayName,
        title: student.displayName,
        description: student.bio || `${student.department || 'Department'} - ${student.batch || 'Network Member'}`
      };
    }
    // Placeholder nodes
    return {
      id: `placeholder-${i}`,
      src: "",
      alt: "Empty Slot",
      title: "Open Seat",
      description: "This spot belongs to one of the members of the network. Register now to claim it!"
    };
  });

  const isMobile = size < 640;

  const config = {
    containerSize: size,
    sphereRadius: size * (isMobile ? 0.40 : 0.35),
    dragSensitivity: 0.8,
    momentumDecay: 0.96,
    maxRotationSpeed: 6,
    baseImageScale: isMobile ? 0.26 : 0.21, 
    hoverScale: isMobile ? 1.2 : 1.4, 
    perspective: 1000,
    autoRotate: true,
    autoRotateSpeed: 0.2
  };

  return (
    <section className="w-full relative z-20 flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-brand-highlight mb-4 tracking-tight">Meet Us</h2>
        <p className="text-brand-pink max-w-lg mx-auto font-medium">
          Let us introduce ourselves so you get to know the individuals in our network
        </p>
        <p className="text-[10px] font-black text-brand-highlight/60 uppercase tracking-widest mt-4 animate-pulse">
          Tap on the image circles to view profile
        </p>
      </motion.div>

      <div className="flex justify-center items-center w-full -translate-x-3 md:translate-x-0">
        {loading ? (
          <div className="animate-pulse bg-brand-plum/10 rounded-full" style={{ width: size, height: size }} />
        ) : (
          <SphereImageGrid
            images={sphereImages}
            isLoggedIn={!!user}
            className="mx-auto"
            {...config}
          />
        )}
      </div>
    </section>
  );
}
