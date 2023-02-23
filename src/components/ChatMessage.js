import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';

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

      const tagRegex = /@([\w\s]+)/g;
      const matches = text.match(tagRegex);
      if (matches) {
        const replacedMatches = await Promise.all(matches.map(async (match) => {
          const username = match.substring(1);
          const userRef = firebase.database().ref(`users`).orderByChild('username').equalTo(username);
          const snapshot = await userRef.once('value');
          const exists = snapshot.exists();
          console.log(`Username: ${username}, Exists: ${exists}`);
          if (exists) {
            return `<a href="/profile/${username}" style="color: blue;">@${username}</a>`;
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

  const usernameClass = messageClass === 'sent' ? 'username-sent' : 'username-received';

  return (
    <div className={`message ${messageClass}`}>
      <div className="message-content">
        {username && taggedText && (
          <p
            className="message-text"
            dangerouslySetInnerHTML={{
              __html: `<span class="${usernameClass}">${username}: </span>${taggedText}`
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
