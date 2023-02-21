import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';

const ChatMessage = ({ message }) => {
  const { text, uid } = message;
  const messageClass = uid === firebase.auth().currentUser.uid ? 'sent' : 'received';

  const [username, setUsername] = useState(null);
  useEffect(() => {
    firebase.database().ref(`users/${uid}/username`).once('value')
      .then(snapshot => {
        const data = snapshot.val();
        if (data) {
          setUsername(data);
        } else {
          setUsername(firebase.auth().displayName);
        }
      });
  }, [uid]);

  const detectLink = text => {
    const reg = /(https?:\/\/[^\s]+)/g;
    return text.replace(reg, '<a href="$1" style="color: blue;">$1</a>');
  };

  const tagRegex = /@(\w+)/g;
  const taggedText = detectLink(text.replace(tagRegex, '<a href="/profile/$1" style="color: blue;">@$1</a>'));
  const usernameClass = messageClass === 'sent' ? 'username-sent' : 'username-received';

  return (
    <div className={`message ${messageClass}`}>
      <div className="message-content">
        <p
          className="message-text"
          dangerouslySetInnerHTML={{
            __html: `<span class="${usernameClass}">${username}: </span>${taggedText}`
          }}
        />
      </div>
    </div>
  );
};

export default ChatMessage;
