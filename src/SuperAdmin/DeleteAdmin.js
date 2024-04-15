import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarSuperAdmin';

const DeleteAdmin = () => {
    const [Admin, setAdmin] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await fetch('http://localhost:5000/super-admin-get-all-admin', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
            },
          });
          const data = await response.json();
          setAdmin(data.results);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
      fetchData();
    }, []);

    const handleDeleteAdmin = async (adminID) => {
        try {
          const response = await fetch(`http://localhost:5000/delete-admin/${adminID}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
            },
          });
    
          if (response.ok) {
            // Successfully deleted, update the adminList state
            alert('Delete Admin successfully!');
            setAdmin(Admin.filter(Admin => Admin.AdminID !== adminID));
            console.log('Delete Admin successfully!');
          } else {
            // Handle error
            console.error('Failed to delete admin account');
          }
        } catch (error) {
          console.error('Error deleting admin account:', error);
        }
      };
  
    return (
      <div>
        <NavbarAdmin />
        <div className="min-h-screen p-6 bg-light-yellow flex ">
          <div className="container max-w-screen-lg mx-auto">
            <div className="relative">
            </div>
            <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
              <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
                <div className="text-gray-600">
                  <p className="font-medium text-lg text-black">Delete Admin Account / ลบบัญชีผู้ดูแลระบบ </p>
                </div>
                <div className="lg:col-span-2">
                  <table className="w-full text-md bg-white shadow-md rounded mb-4">
                    <tbody>
                      <tr className="border-b">
                        <th className="text-left p-3 px-5">AdminID / แอดมินไอดี</th>
                        <th className="text-left p-3 px-5">Email / อีเมล</th>
                        <th className="text-left p-3 px-5">Roles / ตำแหน่ง</th>
                        <th className="text-left p-3 px-5">Hospital Name / โรงพยาบาล</th>
                      </tr>
                      {Admin.map((Admin) => (
                        <tr key={Admin.AdminID} className="border-b hover:bg-orange-100 bg-gray-100">
                        <td className="p-3 px-5 bg-gray-50">{Admin.AdminID}</td>
                            <td className="p-3 px-5 bg-gray-50">{Admin.email}</td>
                            <td className="p-3 px-5 bg-gray-50">{Admin.roles}</td>
                            <td className="p-3 px-5 bg-gray-50">
                                <div>{Admin.hos_name}</div>
                            </td>
                            <td className="p-3 px-5 bg-gray-50">
                                <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleDeleteAdmin(Admin.AdminID)}
                                >
                                    Delete Account / ลบบัญชี
                                </button>
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="md:col-span-4 text-right">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default DeleteAdmin