import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchLists } from "../api/contactAPI"; // Ensure this points to /fetch
import { useAuth } from "./AuthContext";

const ContactContext = createContext();

export const ContactProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadContactData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchLists();
      if (res.data.success) {
        // Your backend returns a 'list' object with these arrays
        setFriends(res.data.list.contacts || []);
        setPendingRequests(res.data.list.pendingRequests || []);
        setBlockedUsers(res.data.list.blockedUsers || []);
      }
    } catch (err) {
      console.error("Syncra Error: Failed to fetch contact lists", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadContactData();
  }, [loadContactData]);

  return (
    <ContactContext.Provider 
      value={{ 
        friends, 
        pendingRequests, 
        blockedUsers,
        loading, 
        refreshContacts: loadContactData 
      }}
    >
      {children}
    </ContactContext.Provider>
  );
};

export const useContact = () => useContext(ContactContext);