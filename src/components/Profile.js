import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import firebase from 'firebase/app';

const Profile = () => {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const db = firebase.database();
    const userRef = db.ref("users/" + username);

    userRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUserData(data);
      } else {
        const user = firebase.auth().currentUser;
        setUserData({ username: user.displayName, userId: user.uid });
      }
    });

    return () => {
      userRef.off();
    };
  }, [username]);

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Username: {userData.username}</p>
      <p>User ID: {userData.userId}</p>
    </div>
  );
};

export default Profile;
