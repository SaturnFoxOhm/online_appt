import React from 'react'
import { Link, redirect } from 'react-router-dom';
import './css/navbar.css';
import liff from '@line/liff';

const logout = () => {
  liff.init({ liffId: '2002781192-5JV9lL87' }, () => {
    try{
      if (liff.isLoggedIn()) {
        liff.logout();
      } 
    }catch(err){
      console.error(err)
    }
  }, err => console.error(err)); 
  localStorage.removeItem('token');
  window.location.href = `/`;
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
            <Link to="/user">
              <label className="logo">FastAppt</label>
            </Link>
            <ul>
              <li>
                <Link className='Navbar' to="/user"> Home </Link>
              </li>
              <li>
                <Link className='Navbar' to="/user/about"> About </Link>
              </li>
              <li>
                <Link className='Navbar' to="/user/profile"> Profile </Link>
              </li>
              <li>
                <Link className='Navbar' to="/user/appointmentlist"> My Appointment / การจองของฉัน </Link>
              </li>
              <li>
                <Link className='Navbar' to="/user/cart"> Cart / ตะกร้า </Link>
              </li>
              <li>
                <Link className='Navbar' onClick={() => logout()}> Sign Out </Link>
              </li>
            </ul>
          </nav>
    </div>
  )
}

export default navbar;
