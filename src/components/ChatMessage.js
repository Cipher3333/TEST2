import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import { Link, useNavigate } from 'react-router-dom';

const ChatMessage = ({ message }) => {
  const { text, uid } = message;
  const messageClass = uid === firebase.auth().currentUser.uid ? 'sent' : 'received';

  const [username, setUsername] = useState(null);
  const [taggedText, setTaggedText] = useState(null);
  useEffect(() => {
    const fetchUsernameAndTaggedText = async () => {
      const usernameSnapshot = await firebase.database().ref(`users/${uid}/username`).once('value');
      const usernameData = usernameSnapshot.val();
      if (usernameData) {
        setUsername(usernameData);
      } else {
        setUsername(firebase.auth().displayName);
      }

      const tagRegex = /@(\w+)/g;
      const matches = text.match(tagRegex);
      if (matches) {
        const replacedMatches = await Promise.all(matches.map(async (match) => {
          const username = match.substring(1);
          const userRef = firebase.database().ref(`users`).orderByChild('username').equalTo(username);
          const snapshot = await userRef.once('value');
          const exists = snapshot.exists();
          console.log(`Username: ${username}, Exists: ${exists}`);
          if (exists) {
            return <Link to="/profile/${username}" style="color: blue;"><button className="sign-out" onClick={handleUsernameClick}>@${username}</button></Link>;
          } else {
            return `@${username}`;
          }
        }));
        let currentIndex = 0;
        const newTaggedText = text.replace(tagRegex, () => replacedMatches[currentIndex++]);
        setTaggedText(newTaggedText);
      } else {
        setTaggedText(text);
      }
    };

    fetchUsernameAndTaggedText();
  }, [uid, text]);

  const history = useNavigate();
  const handleUsernameClick = () => {
    history.push(`/profile/${username}`);
  };

  const usernameClass = messageClass === 'sent' ? 'username-sent' : 'username-received';

  return (
    <div className={`message ${messageClass}`}>
      <div className="message-content">
        {username && taggedText && (
          <p className="message-text">
            <span className={usernameClass} onClick={handleUsernameClick}>{username}: </span>
            <span dangerouslySetInnerHTML={{ __html: taggedText }} />
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
