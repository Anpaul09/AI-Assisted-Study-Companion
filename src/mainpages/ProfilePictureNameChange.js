import { createContext, useState, useEffect } from "react";
import { auth } from "../config/firebase"; // import Firebase auth

export const ProfilePictureNameChange = createContext(); // create context

export const ProfilepicNameChange = ({ children }) => {
  const [userData, setUserData] = useState({ name: "", email: "" }); // this will store the user's name and user's email 
  const [profilePicture, setProfilePicture] = useState(null); // this will store the profile picture

  // get the user's data also the user's profile picture
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await user.reload(); // this will reload the user's info
        setUserData({ name: user.displayName, email: user.email }); // set the user's name and user's email
        setProfilePicture(user.photoURL || null); // also set the user's profile picture
      } else {
        setUserData({ name: "", email: "" }); // if there is no user reset the user's name and user's email
        setProfilePicture(null); // and set the profile picture to null
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <ProfilePictureNameChange.Provider
      value={{ userData, setUserData, profilePicture, setProfilePicture }}
    >
      {children} {/* components inside get the user's data and user's picture */}
    </ProfilePictureNameChange.Provider>
  );
};
