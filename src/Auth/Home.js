import React, { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import { Link } from 'react-router-dom';
import Navbar from './navbar'; // Assuming Navbar is the correct filename and default export
import './css/Home.css';
import liff from '@line/liff';

const logout = () => {
  liff.logout();
  window.location.reload();
}

// const initLine = () => {
//   liff.init({ liffId: '2002781192-5JV9lL87' }, () => {
//     if (liff.isLoggedIn()) {
//       runApp();
//     } else {
//       liff.login( {redirectUri: "https://online-appt-9snh.vercel.app/test" });
//     }
//   }, err => console.error(err));
// }

const Home = () => {
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

  return (
    <div>
      <Navbar />
      <div className="min-h-screen min-w-screen bg-gradient-to-r from-green-500 to-emerald-300">
        <div className="mx-auto max-w-7xl py-12 sm:px-6 sm:py-16 lg:px-8 reveal-container">
          <div className="relative isolate overflow-hidden bg-green-800 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
            <svg
              viewBox="0 0 1024 1024"
              className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
              aria-hidden="true"
            >
              <circle
                cx="512"
                cy="512"
                r="512"
                fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                fillOpacity="0.7"
              />
              <defs>
                <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                  <stop stopColor="#7775D6" />
                  <stop offset="1" stopColor="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
            <div className="mx-auto max-w-lg text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Boost your Health.<br />Start using our service today.
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                We will assist you to have a faster health appointment, faster health checkup, and better your health status!!!
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <a
                  href="/user/testSelection"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-green-900 shadow-sm hover:bg-gray-400"
                >
                  Start Appointment / เริ่มการนัดหมาย
                </a>
                <Link to="/user/about"
                  className="text-sm font-semibold leading-6 text-white"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center mt-16 h-80 lg:relative lg:flex-none lg:justify-start md:max-lg:flex md:max-lg:justify-center sm:max-md:flex sm:max-md:max-lg:justify-center reveal-container2">
              <img
                className="absolute w-[22rem] top-0 max-w-none rounded-md bg-white/5 ring-1 ring-white/10 items-center lg:w-[29rem]"
                src="../images/Intro-pic-new.png"
                alt="App screenshot"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
