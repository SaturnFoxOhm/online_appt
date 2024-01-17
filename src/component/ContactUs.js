import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/contact-us.css'; // Import your contact-us.css file
import Navbar from "./navbar"

const ContactUsPage = () => {
    const sr = ScrollReveal({
        distance: '65px',
        duration: 2600,
        delay: 450,
        reset: true,
      });

    useEffect(() => {
        // Use ScrollReveal here
        sr.reveal('.contact-topic', { delay: 200, origin: 'bottom' });
        sr.reveal('.contact-subtopic', { delay: 200, origin: 'bottom' });
        sr.reveal('.contact-img', { delay: 500, origin: 'left' });
        sr.reveal('.contact-text', { delay: 700, origin: 'right' });
      }, []); // Empty dependency array means this effect runs once when the component mounts
    return (
      <div>
        <head>
          <meta charSet="utf-8" />
          <title>Contact Us</title>
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
          <section className="contact">
          <div className="circle-banner" style={{ backgroundImage: 'url(/images/contact.jpg)', backgroundSize: 'cover', backgroundAttachment: 'fixed'}}>
          </div>
            <div className="contact-info">
            <h1 className="contact-topic">Contact Us</h1>
              </div>
            <div className="contact-text">
              <p>
                Feel free to contact us with any questions, feedback, or concerns. 
                We are here to assist you and provide the best possible support. 
                Your health and well-being are our top priorities.
              </p>
            <div className="contact-text contact-split">
              {/* Address Section */}
                <div>
                  <h2 style={{ fontWeight: 'bold' }}>Address</h2>
                    <p>
                      123 Street Name, City, Country
                    {/* <br /> */}
                    </p>
                </div>
              {/* Phone Section */}
                <div>
                  <h2 style={{ fontWeight: 'bold' }}>Phone</h2>
                    <p>+123 456 7890</p>
                </div>
              {/* Email Section */}
                <div>
                  <h2 style={{ fontWeight: 'bold' }}>Email</h2>
                    <p>info@example.com</p>
                </div>
              </div>
            </div>
        </section>
      </body>
    </div>
  );
};

export default ContactUsPage;
