import React from 'react'
import { Link } from 'react-router-dom';
import './css/NavbarSuperAdmin.css';

export const NavbarSuperAdmin = () => {

const logout = () => {
    localStorage.removeItem('tokenSuperAdmin');
    window.location.reload();
}

  return (
    <div className='adminNav'>
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
            <label className="logo color-black">FastAppt</label>
            <ul>
              <li>
                <Link className='Navbar' to="/super-admin"> Home </Link>
              </li>
              <li>
                <Link className='Navbar' to="/super-admin/usersAppointment"> Users' Appointment </Link>
              </li>
              <li>
                <Link className='Navbar' to="/super-admin/sendTestReport"> Send Test Report </Link>
              </li>
              <li>
                <Link className='Navbar' to="/super-admin/selectTimeslot"> Time Slot </Link>
              </li>
              <li>
                <Link className='Navbar' to="/super-admin"> Specimen Transportation </Link>
              </li>
              {/* <li>
                <Link className='Navbar' to="/admin"> Test List </Link>
              </li> */}
              <li>
                <Link className='Navbar' onClick={() => logout()}> Sign Out </Link>
              </li>
            </ul>
          </nav>
    </div>
  )
}

export default NavbarSuperAdmin;