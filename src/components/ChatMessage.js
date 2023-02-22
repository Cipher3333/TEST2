import React from 'react';
import firebase from 'firebase/app';

const ChatMessage = ({ message }) => {
  const { text, uid } = message;
  const messageClass = uid === firebase.auth().currentUser.uid ? 'sent' : 'received';

  const [username, setUsername] = React.useState(null);
  React.useEffect(() => {
    firebase.database().ref('users/' + uid + '/username').once('value').then((snapshot) => {
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
  const taggedText = detectLink(text.replace(tagRegex, (match, username) => {
    const userRef = firebase.database().ref(`users`).orderByChild('username').equalTo(username);
    userRef.once('value').then(snapshot => {
      const exists = snapshot.exists();
      if (exists) {
        return `<a href="/profile/${username}" style="color: blue;">@${username}</a>`;
      } else {
        return `@${username}`;
      }
    });
  }));

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
