import React, { useEffect, useRef, useState } from 'react';
 
//Import Firbase component
import firebase from 'firebase/app';
 
//Import FirebaseAuth component
import { useCollectionData } from 'react-firebase-hooks/firestore';
 
// Import FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
 
// Importing Component
import ChatMessage from './ChatMessage';
 
function ChatRoom() {
    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const database = firebase.database();

    const dummy = useRef();
    const messagesRef = firestore.collection('messages');
    const query = messagesRef.orderBy('createdAt');
    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [username, setUsername] = useState(null);
 
    const scrollToBottom = () =>{
        dummy.current?.scrollIntoView({behavior: "smooth"})
    }
 
   useEffect(()=>{
        let isMounted = true;
        scrollToBottom();
        const fetchUsername = async () => {
          const uid = auth.currentUser.uid;
          const usernameRef = database.ref(`users/${uid}/username`);
          const usernameSnapshot = await usernameRef.once('value');
          let username = usernameSnapshot.val();
          if (!username) {
           // if the user doesn't have a username in the database, use their Google account username
           const user = auth.currentUser;
           username = user.displayName || user.email;
           usernameRef.set(username);
          }
          if (isMounted) {
           setUsername(username);
          }
           setUsername(username);
        };

        if (auth.currentUser) {
          fetchUsername();
        }
        return () => {
         isMounted = false;
        };
    }, [auth, database]);
    const [cooldown, setCooldown] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();
    
        if (cooldown) {
            return;
        }
    
        setCooldown(true);
        setIsSending(true);
    
        const { uid, photoURL, displayName, email } = auth.currentUser;
    
        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
            username,
            displayName,
            email
        })
    
        setFormValue('');
        scrollToBottom();    
    
        setTimeout(() => {
            setIsSending(false);
            setCooldown(false);
        }, 3000);
    };
    
 
    return (<>
        <main>
 
            {messages && messages.map((msg, index, pool) => {
              const prev = pool[index-1];
              const next = pool[index+1]
              return <ChatMessage key={msg.id} message={msg} neighbour={{prev, next}} />
            })}
 
            <span ref={dummy}></span>
        </main>
 
        <form onSubmit={sendMessage}>
 
            <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Type a message" />
 
            <button className="chat-message-button" type="submit" disabled={!formValue || isSending}>
                <FontAwesomeIcon icon={faPaperPlane} />
            </button>
 
        </form>
    </>)
}
 
export default ChatRoom


