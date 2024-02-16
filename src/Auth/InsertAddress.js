import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';

const Address = () => {
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [province, setProvince] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const navigate = useNavigate();

    const insertAddress = async (e) => {
        try {
            const CurrentInfoID = localStorage.getItem('InfoID');

            const response = await fetch('http://localhost:5000/insert-address', {
                method: 'POST',
                headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address1: addressLine1,
                    address2: addressLine2,
                    province: province,
                    city: city,
                    postcode: postalCode,
                    CurrentInfoID: CurrentInfoID
                }),
            });
    
            if (response.ok) {
                // Handle success
                console.log('Insert Address successfully');
                navigate('/user/hospital');
            } 
            else {
                // Handle error
                console.error('Failed to insert address');
            }
        } 
        catch (error) {
            console.error('Error adding user data:', error);
        }
    };

    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                    <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `25%` }}> 25 %</div>
                </div>
                <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                    Appoint Health Checkup
                </h2>
                </div>

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5">
                <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-1">
                    <div className="text-gray-600">
                        <p className="font-large text-xl text-black whitespace-nowrap">Insert your address</p>
                        <br/>
                        <form onSubmit={insertAddress}>
                            <label>
                            Address line 1 *
                            <input type="text" required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
                            </label>
                            <br />
                            <label>
                            Address line 2 (optional)
                            <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                            </label>
                            <br />
                            <label>
                            Province *
                            <input type="text" required value={province} onChange={(e) => setProvince(e.target.value)} />
                            </label>
                            <br />
                            <label>
                            City *
                            <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} />
                            </label>
                            <br />
                            <label>
                            Postal code *
                            <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                            </label>
                            <br />
                            <div style={{ display: 'grid', placeItems: 'end' }}>
                                <button 
                                type="submit"
                                className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                Next
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Address;