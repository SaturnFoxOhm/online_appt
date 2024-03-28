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
            <Link to="/">
              <label className="logo">FastAppt</label>
            </Link>
            <ul>
              <li>
                <Link className='Navbar' to="/"> Home </Link>
              </li>
              <li>
                <Link className='Navbar' href="/service">Service / บริการ</Link>
              </li>
              <li>
                <Link className='Navbar' to="/about"> About / เกี่ยวกับเรา</Link>
              </li>
              <li>
                <Link className='Navbar' href="/contactus">Contact Us / ติดต่อเรา</Link>
              </li>
              <li>
                <Link className='Navbar' to="/login"> Sign In / เข้าสู่ระบบ</Link>
              </li>
            </ul>
          </nav>
    </div>
  )
}

export default navbar;
