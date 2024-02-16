import React, { useState, useEffect } from 'react';
import NavbarSuperAdmin from './NavbarSuperAdmin';

const SignupAdmin = () => {
  const [datahospital, setDataHospital] = useState([]); // Default role is 'admin'
  const [role, setRole] = useState(''); // Default role is 'admin'
  const [selectedHospital, setSelectedHospital] = useState(''); // Default hospital is 'null
  const [hospitalOptions, setHospitalOptions] = useState([]); // State to store fetched hospital options

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleHospitalChange = (event) => {
    setSelectedHospital(event.target.value);
    // Set role based on the selected hospital
    if(event.target.value === "Ramathibodi School of Nursing"){
      setRole('superadmin');
    }
    else if(event.target.value === ""){
      setRole('');
    }
    else{
      setRole('admin');
    }
  };

  // Regex pattern for a simple AdminID validation
  const AdminIDRegex = /^[0-9]*$/;
  // Regex pattern for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Function to check if the email is valid
  // emailRegex.test(value);

  const SignupNewAdmin = async (event) => {
    event.preventDefault(); // Prevent form submission

    const AdminID = document.getElementById('AdminID').value;
    const email = document.getElementById('email').value;
    const passwords = document.getElementById('passwords').value;
    const confirmPasswords = document.getElementById('confirmPasswords').value;
    if(!AdminIDRegex.test(AdminID)){
      alert('AdminID should be number only.');
      return; // Do not proceed with signup
    }
    else if(!emailRegex.test(email)){
      alert('Invalid Email Format.');
      return; // Do not proceed with signup
    }
    else if (passwords !== confirmPasswords) {
      alert('Passwords do not match. Please enter matching passwords.');
      return; // Do not proceed with signup
    }
    else if (role === '') {
      alert('Please select the Role.');
      return; // Do not proceed with signup
    }
    else if (selectedHospital === '') {
      alert('Please select the Hospital.');
      return; // Do not proceed with signup
    }
    else{
      const response = await fetch('http://localhost:5000/super-admin-get-all-admin', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
          },
        });
        const data = await response.json();
        for (const admin of data.results) {
          if (AdminID === admin.AdminID.toString()) {
            alert('AdminID already has been used.');
            return; // Do not proceed with signup
          }
        }
        for(const hospital of datahospital){
          if(selectedHospital === hospital.hos_name){
            const newAdmin = {
              AdminID: AdminID,
              email: email,
              passwords: passwords,
              roles: role,
              HospitalID: hospital.HospitalID
            };
      
            // Make a POST request to update the statuses on the server
            const response = await fetch('http://localhost:5000/super-admin-insert-new-admin', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
              },
              body: JSON.stringify(newAdmin),
            });
      
            if (response.ok) {
              alert('Admin Inserted successfully');
              window.location.href = `/super-admin/signup-admin`;
            } else {
              console.error('Failed to update statuses:', response.statusText);
            }
          }
        }
    }
  };

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await fetch('http://localhost:5000/super-admin-get-all-hospitals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
          },
        });
        const data = await response.json();
        setDataHospital(data.results);

        // Filter hospitals based on the role
        const filteredHospitals = data.results.filter(hospital => {
          if (role === 'admin' && selectedHospital === '') {
            // Show all hospitals except the first one
            return hospital !== data.results[0];
          } else if (role === 'superadmin' && selectedHospital === '') {
            // Show all hospitals for superadmin
            return hospital === data.results[0];
          }
          return true;
        });

        const hospitalNames = filteredHospitals.map(hospital => hospital.hos_name);
        setHospitalOptions(['', ...hospitalNames]);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchHospitals();
  }, [role]);  // Dependency on 'role' ensures that it runs whenever 'role' changes

  return (
    <div>
      <NavbarSuperAdmin />
      <section className="bg-white min-h-screen flex items-center justify-center" style={{ marginTop: '6rem' }}>
        <div className="bg-yellow-400 lg:w-6/12 md:7/12 w-8/12 shadow-3xl rounded-xl">
          <div className="bg-gray-800 shadow shadow-gray-200 absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-4 md:p-8">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#FFF">
              <path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z" />
            </svg>
          </div>
          <form className="pt-12 md:pt-24 pb-12 md:pb-24" onSubmit={SignupNewAdmin}>
            <div className="flex items-center justify-center text-lg mb-6 md:mb-8">
              <h1 className="font-bold text-3xl text-gray-800">Add New Admin Account</h1>
            </div>
            <div className="flex items-center text-lg mb-6 md:mb-8">
              <svg className="absolute ml-3 mt-1" width="24" viewBox="0 0 24 24">
                <path d="M20.822 18.096c-3.439-.794-6.64-1.49-5.09-4.418 4.72-8.912 1.251-13.678-3.732-13.678-5.082 0-8.464 4.949-3.732 13.678 1.597 2.945-1.725 3.641-5.09 4.418-3.073.71-3.188 2.236-3.178 4.904l.004 1h23.99l.004-.969c.012-2.688-.092-4.222-3.176-4.935z" />
              </svg>
              <input type="test" id="AdminID" required className="bg-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full" placeholder="AdminID" />
            </div>
            <div className="flex items-center text-lg mb-6 md:mb-8">
            <svg className="absolute ml-3 mt-1" width="24" viewBox="0 0 24 24">
                <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z" />
              </svg>
              <input type="test" id="email" required className="bg-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full" placeholder="Email" />
            </div>
            <div className="flex items-center text-lg mb-6 md:mb-8">
              <svg className="absolute ml-3 mt-1" viewBox="0 0 24 24" width="24">
                <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
              </svg>
              <input type="password" id="passwords" required className="bg-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full" placeholder="Password" />
            </div>
            <div className="flex items-center text-lg mb-4 md:mb-4">
              <svg className="absolute ml-3 mt-1" viewBox="0 0 24 24" width="24">
                <path d="m18.75 9h-.75v-3c0-3.309-2.691-6-6-6s-6 2.691-6 6v3h-.75c-1.24 0-2.25 1.009-2.25 2.25v10.5c0 1.241 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.009 2.25-2.25v-10.5c0-1.241-1.01-2.25-2.25-2.25zm-10.75-3c0-2.206 1.794-4 4-4s4 1.794 4 4v3h-8zm5 10.722v2.278c0 .552-.447 1-1 1s-1-.448-1-1v-2.278c-.595-.347-1-.985-1-1.722 0-1.103.897-2 2-2s2 .897 2 2c0 .737-.405 1.375-1 1.722z" />
              </svg>
              <input type="password" id="confirmPasswords" required className="bg-gray-200 rounded pl-12 py-2 md:py-4 focus:outline-none w-full" placeholder="Confirm Password" />
            </div>
            {/* Role Selection Panel */}
            <div className="text-lg mb-4 md:mb-4">
              <label htmlFor="role" className="block font-bold text-gray-800 mb-2">Select Role:</label>
              <select
                id="role"
                value={role}
                onChange={handleRoleChange}
                className="bg-gray-200 rounded pl-3 pr-10 py-2 md:py-4 focus:outline-none w-full"
              >
                <option value="">Select a Role</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {/* Hospital Selection Panel */}
            <div className="text-lg mb-6 md:mb-8">
              <label htmlFor="hospital" className="block font-bold text-gray-800 mb-2">
                Select Hospital:
              </label>
              <select
                id="hospital"
                value={selectedHospital}
                onChange={(event) => {
                  setSelectedHospital(event.target.value);
                  handleHospitalChange(event);
                }}
                className="bg-gray-200 rounded pl-3 pr-10 py-2 md:py-4 focus:outline-none w-full"
              >
                {hospitalOptions.map((hospital, index) => (
                  <option key={index} value={hospital}>
                    {hospital || 'Select a Hospital'}
                  </option>
                ))}
              </select>
            </div>
            <button className="bg-gradient-to-b from-gray-700 to-gray-900 font-medium p-2 md:p-4 text-white uppercase w-full rounded">Sign Up</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SignupAdmin;
