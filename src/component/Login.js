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
      if (liff.isLoggedIn()) {
        await runApp();

        const data = { userId, displayName };

        console.log('user id: ', userId);
        console.log('display name: ', displayName);
        console.log('data: ', data);

        fetch('http://localhost:5000/store-line-login-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lineUserId: userId, displayName }),
        })
          .then(response => response.json())
          .then(result => {
            console.log('Line login data stored successfully:', result);
          })
          .catch(error => {
            console.error('Error storing Line login data:', error);
          });
      }
    }, err => console.error(err));
  }, [])
  
  const initLine = async () => {
    try{
      if (liff.isLoggedIn()) {
        await runApp();

        const data = { userId, displayName };

        console.log('user id: ', userId);
        console.log('display name: ', displayName);
        console.log('data: ', data);

        fetch('http://localhost:5000/store-line-login-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lineUserId: userId, displayName }),
        })
          .then(response => response.json())
          .then(result => {
            console.log('Line login data stored successfully:', result);
          })
          .catch(error => {
            console.error('Error storing Line login data:', error);
          });
      } 
      else {
        liff.login( {redirectUri: "https://online-appt.vercel.app/login" });
      }
    }catch(err){
      console.error(err)
    }
  }
  
  const runApp = () =>{
      const idToken = liff.getIDToken();
      setIdToken(idToken)

      liff.getProfile()
      .then(profile => {
        console.log(profile);
        setDisplayName(profile.displayName);
        setPictureUrl(profile.pictureUrl);
        setStatusMessage(profile.statusMessage);
        setUserId(profile.userId);
      })
      .catch(err => console.error(err));
    }
    
    const [pictureUrl, setPictureUrl] = useState(logo);
    const [idToken, setIdToken] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [userId, setUserId] = useState("");

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
