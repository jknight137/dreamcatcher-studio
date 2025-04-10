"use client";

import { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const UserContext = createContext<any>({}); // Use `any` temporarily; refine type later

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const createUser = (email: string, password: string) => {
    if (!auth) {
      console.error("Auth not initialized");
      return Promise.reject(new Error("Authentication service unavailable"));
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logIn = (email: string, password: string) => {
    console.log("Logging in", email);
    if (!auth) {
      console.error("Auth not initialized");
      return Promise.reject(new Error("Authentication service unavailable"));
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = () => {
    if (!auth) {
      console.error("Auth not initialized");
      return Promise.reject(new Error("Authentication service unavailable"));
    }
    return signOut(auth);
  };

  useEffect(() => {
    if (!auth) {
      console.error("Firebase Auth not initialized. Skipping auth state listener.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      setLoading(false);
    }, (error) => {
      console.error("Auth state error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{ user, createUser, logIn, logOut, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(UserContext);
};