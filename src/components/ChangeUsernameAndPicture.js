import React, { useState } from 'react';
import { Button, Input, IconButton } from '@material-ui/core';
import ImageIcon from '@material-ui/icons/Image';
import firebase from 'firebase/app';
import 'firebase/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCommentAlt } from '@fortawesome/free-solid-svg-icons'
import './ChangeUsernameAndPicture.css';
import { NavLink } from 'react-router-dom';
const ChangeUsernameAndPicture = (props) => {
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const auth = firebase.auth()

  const handleProfilePictureChange = (e) => {
    setProfilePicture(URL.createObjectURL(e.target.files[0]));
  };

  const handleUsernameChange = () => {
    firebase.database().ref('users/' + firebase.auth().currentUser.uid + '/username').set(username)
      .then(() => {
        setSuccess(true);
        setError(null);
      })
      .catch((error) => {
        setSuccess(false);
        setError(error.message);
      });
  };

  return (
    <div className="change-username-and-picture">
      <h2>Change username and picture</h2>
      <Input 
        type="text" 
        placeholder="Enter new username" 
        value={username}
        onChange={e => {
        if (e.target.value.length <= 10) {
        setUsername(e.target.value);
        setError(null);
        } else {
        setError('Word limit is 10');
        setSuccess(false);
        }
        }}
      />
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleProfilePictureChange} 
        style={{ display: 'none' }} 
        id="upload-profile-picture"
      />
      <label htmlFor="upload-profile-picture">
        <IconButton 
          color="primary" 
          aria-label="upload picture" 
          component="span"
        >
          <ImageIcon />
        </IconButton>
      </label>
      {profilePicture && (
        <div>
          <img src={profilePicture} alt="Profile" />
        </div>
      )}
      <Button variant="contained" color="primary" onClick={handleUsernameChange}>
        Change
      </Button>
      {error && (
        <p className="error">Error: {error}</p>
      )}
      {success && (
        <p className="success">Username changed successfully!</p>
      )}
      {auth.currentUser && (<NavLink to="/sign-in-button"><p><button className="sign-out" onClick={() => auth.signOut()}>SignOut</button></p></NavLink>)}
      <span className="chat-icon">
        <NavLink to="/">
          <button className="chat-icon">
            <FontAwesomeIcon icon={faCommentAlt} />
          </button>
        </NavLink>
      </span>
      <p>NOTE: Profile Image is currently unavailable!</p>
      <span className="privacy-link">
        <NavLink to="/privacy-policy" target="_blank">
          Privacy Policy
        </NavLink>
      </span>
    </div>
  );
};

export default ChangeUsernameAndPicture;
