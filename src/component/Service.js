import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/service.css'; // Import your service.css file
import Navbar from "./navbar"

const ServicePage = () => {
    const sr = ScrollReveal({
        distance: '65px',
        duration: 2600,
        delay: 450,
        reset: true,
      });

    useEffect(() => {
        // Use ScrollReveal here
        sr.reveal('.service-topic', { delay: 200, origin: 'bottom' });
        sr.reveal('.service-subtopic', { delay: 200, origin: 'bottom' });
        sr.reveal('.service-img', { delay: 500, origin: 'left' });
        sr.reveal('.service-text', { delay: 700, origin: 'right' });
      }, []); // Empty dependency array means this effect runs once when the component mounts
  return (
    <div>
      <head>
        <meta charSet="utf-8" />
        <title>Service Page</title>
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
        <section className="service">
        <div className="circle-banner" style={{ backgroundImage: 'url(/images/service.jpg)', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
            <h1 className="service-topic">Our Services</h1>
          </div>
            <div className="service-text">
              <div className="feature">
                <h2>Onsite Collection Service (Make an appointment online)</h2>
                <p>
                Book an appointment online for an easy-to-use, convenient in-person blood test at one of our centres. Our onsite collection service makes the process of getting a blood test quick and easy.
                </p>
              </div>
              <div className="feature">
                <h2>At-home blood collection service</h2>
                <p>
                For those who prefer the comfort of their homes, our At-Home Blood collection service allows you to schedule a professional phlebotomist to collect samples in the privacy of your residence.
                </p>
              </div>
            </div>
        </section>
      </body>
    </div>
  );
};

export default ServicePage;
