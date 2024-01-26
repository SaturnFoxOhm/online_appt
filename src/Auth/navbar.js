import React from 'react'
import { Link, redirect } from 'react-router-dom';
import './css/navbar.css';
import liff from '@line/liff';

const logout = () => {
  liff.logout();
  window.location.reload();
}

export const navbar = () => {
  return (
    <div>
        <meta charSet="utf-8" />
          <title>Home Page</title>
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

        <nav>
            <input type="checkbox" id="check" />
            <label htmlFor="check" className="checkbtn">
              <i className="fas fa-bars"></i>
            </label>
            <label className="logo">FastAppt</label>
            <ul>
              <li>
                <Link className='Navbar' to="/user"> Home </Link>
              </li>
              <li>
                <a className='Navbar' href="/user/service">Service</a>
              </li>
              <li>
                <Link className='Navbar' to="/user/about"> About </Link>
              </li>
              <li>
                <a className='Navbar' href="/user/contactus">Contact Us</a>
              </li>
              <li>
                <Link className='Navbar' to="/user/profile"> Profile </Link>
              </li>
              <li>
                <Link className='Navbar' to="/"> Sign Out </Link>
              </li>
            </ul>
          </nav>
    </div>
  )
}

export default navbar;