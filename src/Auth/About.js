import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/about.css'; // Import your about.css file
import Navbar from "./navbar"
import liff from '@line/liff';

const logout = () => {
  liff.logout();
  window.location.reload();
}

const AboutPage = () => {
  const sr = ScrollReveal({
    distance: '20px',
    duration: 1000,
    delay: 200,
    reset: true,
});

useEffect(() => {
    sr.reveal('.reveal', { origin: 'bottom', distance: '20px', duration: 1000, delay: 200 });
}, []);

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
            <section className="bg-gradient-to-b from-white via-green-300 to-green-400 py-10">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-8 text-center reveal">About Us</h1>
                    <p className="font-bold text-lg text-center mb-8 reveal">FastAppt is a hospital appointment assistant</p>
                    <div className="flex flex-col md:flex-row md:justify-center items-center gap-8">
                        <div className="w-64 h-48 md:w-96 md:h-72">
                            <img src="../images/about.jpg" alt="About-pic" className="w-full h-full object-cover rounded-lg reveal" />
                        </div>
                        <div className="max-w-md text-center md:text-left">
                            <p className="text-lg text-gray-700 reveal">FastAppt is a hospital appointment assistant that helps you schedule health checkups easier and faster than before. With a strong emphasis on enhancing customer health status and connection between hospitals, we guarantee to provide a faster and more convenient health checkup for you.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-100 py-10 reveal">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Our Services</h2>
                    <div className="flex flex-col md:flex-row md:justify-center gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
                            <h3 className="text-xl font-semibold mb-2">Onsite Collection Service</h3>
                            <p className="text-gray-700 mb-4">Make an appointment online for an easy-to-use, convenient in-person blood test at one of our centers. Our onsite collection service makes the process of getting a blood test quick and easy.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
                            <h3 className="text-xl font-semibold mb-2">At-home Blood Collection Service</h3>
                            <p className="text-gray-700 mb-4">For those who prefer the comfort of their homes, our At-Home Blood collection service allows you to schedule a professional phlebotomist to collect samples in the privacy of your residence.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-100 py-10 reveal">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Collaboration</h2>
                    <div className="flex flex-col md:flex-row md:justify-center gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
                            <h3 className="text-xl font-semibold mb-2">Partner with Us</h3>
                            <p className="text-gray-700 mb-4">We are always looking for opportunities to collaborate with healthcare providers, technology companies, and other organizations to improve healthcare accessibility and efficiency. If you are interested in partnering with us, please reach out to discuss potential collaboration opportunities.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md flex-1">
                            <h3 className="text-xl font-semibold mb-2">Join Our Network</h3>
                            <p className="text-gray-700 mb-4">Become a part of our growing network of healthcare professionals and service providers. Whether you are a doctor, nurse, technician, or administrator, we welcome you to join our platform and contribute to our mission of making healthcare more accessible to everyone.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-gray-200 py-10 reveal">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
                    <p className="text-lg text-gray-700 mb-6 text-center">Feel free to contact us with any questions, feedback, or concerns. We are here to assist you and provide the best possible support. Your health and well-being are our top priorities.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">Address</h3>
                            <p className="text-gray-700 mb-4">123 Street Name, City, Country</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">Phone</h3>
                            <p className="text-gray-700 mb-4">+123 456 7890</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold mb-2">Email</h3>
                            <p className="text-gray-700 mb-4">test.fastappt@gmail.com</p>
                        </div>
                    </div>
                </div>
            </section>
        </body>
    </div>
);
};

export default AboutPage;
