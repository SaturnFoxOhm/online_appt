import React, { useState } from 'react'
import ScrollReveal from 'scrollreveal';
import { Link } from 'react-router-dom';
import Navbar from './navbar'; // Assuming Navbar is the correct filename and default export
import '../css/Home.css';
import liff from '@line/liff';
import logo from '../logo.svg';

const Test1 = () => {

  const logout = () => {
    liff.logout();
    window.location.reload();
  }
  
  const initLine = () => {
    liff.init({ liffId: '2002781192-5JV9lL87' }, () => {
      if (liff.isLoggedIn()) {
        this.runApp();
      } else {
        liff.login();
      }
    }, err => console.error(err));
  }
  
  const runApp = () =>{
      const idToken = liff.getIDToken();
      setIdToken(idToken)
      liff.getProfile().then(profile => {
        console.log(profile);
        setDisplayName(profile.displayname);
        setPictureUrl(profile.pictureUr);
        setStatusMessage(profile.statusMessage);
        setUserId(profile.userId);
      }).catch(err => console.error(err));
    }
    
    const [pictureUrl, setPictureUrl] = useState(logo);
    const [idToken, setIdToken] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [userId, setUserId] = useState("");

  return (
    <div style={{textAlign: "center"}}>
        <h1>Angular with LINE Login</h1>
        <hr/>
        <img src={pictureUrl} width="300px" height="300px"/>
        <p style={{ textAlign: "left", marginLeft: "20%"}}><b>id token: </b> { idToken }</p>
        <p style={{ textAlign: "left", marginLeft: "20%"}}><b>display name: </b> { displayName }</p>
        <p style={{ textAlign: "left", marginLeft: "20%"}}><b>status message: </b> { statusMessage }</p>
        <p style={{ textAlign: "left", marginLeft: "20%"}}><b>user id: </b> { userId }</p>

        <button onClick={() => logout()} style={{width: "100%", height: "30px"}}>Logout</button>
    </div>
  )
}

export default Test1