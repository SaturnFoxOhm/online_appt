import React from "react";
import { useState, useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/Login.css';
import Navbar from "./navbar"
import liff from '@line/liff';
import logo from '../logo.svg';

const Login = () => {

  const logout = () => {
    liff.logout();
    window.location.reload();
  }

  useEffect(() => {
    // liff.init({ liffId: '2002781192-5JV9lL87' });
    liff.init({ liffId: '2002781192-5JV9lL87' }, () => {
      runApp();
    }, err => console.error(err));
  }, [])
  
  const initLine = async () => {
    try{
      if (liff.isLoggedIn()) {
        runApp();
      } 
      else {
        liff.login( {redirectUri: "https://online-appt.vercel.app/login" });
      }
    }catch(err){
      console.error(err)
    }
  }
  
  const runApp = async () => {
    try {
      const idToken = liff.getIDToken();
      setIdToken(idToken);
  
      const profile = await liff.getProfile();
  
      console.log(profile);
      setDisplayName(profile.displayName);
      setPictureUrl(profile.pictureUrl);
      setStatusMessage(profile.statusMessage);
      setUserId(profile.userId);
  
      const data = { lineUserId: profile.userId, displayName: profile.displayName };
      var SendLineUserID =  profile.userId;
      localStorage.setItem("SendLineUserID", SendLineUserID);
  
      console.log('user id: ', profile.userId);
      console.log('display name: ', profile.displayName);
      console.log('data: ', data);
  
      const response = await fetch('http://localhost:5000/store-line-login-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.status === 200) {
        // User already exists, handle as needed
        const result = await response.json();
        console.log('Line login data already exists:', result);
      } else if (response.status === 302) {
        // Redirect to the sign-up page
        window.location.href = `/signup?lineUserID=${profile.userId}`;
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (err) {
      console.error(err);
    }
  };

    
    const [pictureUrl, setPictureUrl] = useState(logo);
    const [idToken, setIdToken] = useState(null);
    const [displayName, setDisplayName] = useState(null);
    const [statusMessage, setStatusMessage] = useState(null);
    const [userId, setUserId] = useState(null);

    const sr = ScrollReveal({
      distance: '65px',
      duration: 2600,
      delay: 450,
      reset: true,
    });
  
    useEffect(() => {
      // Use ScrollReveal here
      sr.reveal('.reveal-container', { delay: 200, origin: 'top' });
      sr.reveal('.reveal-container2', { delay: 400, origin: 'right' });
    }, []); // Empty dependency array means this effect runs once when the component mounts

    return(
        <div>
          <head>
            <title>Log in Page</title>
          </head>
          <body>
            <Navbar />
            <div className="body">
              <h1 className="Login-topic">Log in</h1>

              {/* <!-- Line login buttons --> */}
              <span class="Btn">
                <button type="button" class="Btn" onClick = {initLine} >
                  <img src="../images/Line_logo.png" alt="Line Logo" style={{ width: "40px", height: "40px", marginRight: "8px" }}/>
                  LOG IN WITH LINE
                </button>
              </span>

              <hr class="solid"/>

              <span class="SignUp">
                Don't have an account?
                <a href="/signup" class="signupbtn">Sign Up</a>
              </span>
              <p style={{ textAlign: "left", marginLeft: "20%"}}><b>id token: </b> { idToken }</p>
              <p style={{ textAlign: "left", marginLeft: "20%"}}><b>display name: </b> { displayName }</p>
              <p style={{ textAlign: "left", marginLeft: "20%"}}><b>status message: </b> { statusMessage }</p>
              <p style={{ textAlign: "left", marginLeft: "20%"}}><b>user id: </b> { userId }</p>

              <button type='submit' onClick={() => logout()} className='Logout'>Log out</button>
            </div>
          </body>
            
        </div>
    );
}

export default Login;
