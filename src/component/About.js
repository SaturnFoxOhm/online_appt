import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/about.css'; // Import your about.css file
import Navbar from "./navbar"
import liff from '@line/liff';

const logout = () => {
  liff.logout();
  window.location.reload();
}

const initLine = () => {
  liff.init({ liffId: '2002781192-5JV9lL87' }, () => {
    if (liff.isLoggedIn()) {
      runApp();
    } else {
      liff.login( {redirectUri: "https://online-appt-9snh.vercel.app/test" });
    }
  }, err => console.error(err));
}

const AboutPage = () => {
    const sr = ScrollReveal({
        distance: '65px',
        duration: 2600,
        delay: 450,
        reset: true,
      });

    useEffect(() => {
        // Use ScrollReveal here
        sr.reveal('.about-topic', { delay: 200, origin: 'bottom' });
        sr.reveal('.about-subtopic', { delay: 200, origin: 'bottom' });
        sr.reveal('.about-img', { delay: 500, origin: 'left' });
        sr.reveal('.about-text', { delay: 700, origin: 'right' });
      }, []); // Empty dependency array means this effect runs once when the component mounts
  return (
    <div>
      <head>
        <meta charSet="utf-8" />
        <title>About Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"
        />
        <link
          href="https://fonts.cdnfonts.com/css/the-hospital"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <section className="about">
          <h1 className="about-topic">About Us</h1>
          <p style={{ fontWeight: 'bold' }} className="about-subtopic">
            FastAppt is a hospital appointment assistant
          </p>
          <div className="about-info">
            <div className="about-img">
              <img src="images/about.jpg" alt="About-pic" />
            </div>
            <div className="about-text">
              <p>
                FastAppt is a hospital appointment assistant that help you appoint the 
                health checkup easier and faster than before. With a strong emphasis on enhancing
                customer health status and connection between each hospitals, we guarantee to 
                provide a faster and more convenience health checkp up for you.
              </p>
              {/* <button>Read More...</button> */}
            </div>
          </div>
        </section>
      </body>
    </div>
  );
};

export default AboutPage;
