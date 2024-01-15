import React from 'react'
import { Link, redirect } from 'react-router-dom';
import '../css/navbar.css';
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
                <Link className='Navbar' to="/"> Home </Link>
              </li>
              <li>
                <a className='Navbar' href="active">Service</a>
              </li>
              <li>
                <Link className='Navbar' to="/about"> About </Link>
              </li>
              <li>
                <a className='Navbar' href="active">Contact Us</a>
              </li>
              <li>
                <Link className='Navbar' to="/login"> Sign In </Link>
              </li>
            </ul>
          </nav>
    </div>
  )
}

export default navbar;