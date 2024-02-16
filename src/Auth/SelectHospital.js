import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';

const Hospital = () => {
    const [hospitalList, setHospitalList] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHospitalData = async () => {
            try {
                const response = await fetch('http://localhost:5000/hospital-list', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setHospitalList(data);
                } else {
                    console.error("Failed to fetch hospital data");
                }
            } catch (error) {
                console.error("Error fetching hospital data:", error);
            }
        };

        fetchHospitalData();
    }, []);

    const handleHospitalChange = (hospitalId) => {
        setSelectedHospital(hospitalId);
    };

    const storeHospital = () => {
        if (selectedHospital) {
            localStorage.setItem('selectedHospital', selectedHospital);
            console.log('Selected hospital stored in local storage:', selectedHospital);
            navigate('/user/datetime');
        } else {
            console.error('No hospital selected');
        }
    };
    
    return(
        <div>
            <Navbar />
            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                    <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                        <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `30%` }}> 30 %</div>
                    </div>
                    <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                        Appoint Health Checkup
                    </h2>
                </div>
                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5">
                    <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-1">
                        <div className="text-gray-600">
                            <p className="font-large text-xl text-black whitespace-nowrap">Select Hospital</p>
                            <br />
                            {/* Render the list of hospitals */}
                                {hospitalList.map(hospital => (
                                    <li key={hospital.HospitalID} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name="hospital"
                                            value={hospital.HospitalID}
                                            checked={selectedHospital === hospital.HospitalID}
                                            onChange={() => handleHospitalChange(hospital.HospitalID)}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '10px', padding: '10px', width: '100%', marginLeft: '10px' }}>
                                            <span><strong>{hospital.hos_name}</strong></span> <br />
                                            <span>Telephone: {hospital.hos_tel}</span><br />
                                            <span>Region: {hospital.hos_region}</span><br />
                                            <span>Location: {hospital.hos_location}</span><br />
                                            <span>Type: {hospital.hos_type}</span>
                                        </div>
                                    </li>
                                ))}
                        </div>
                        <div style={{ display: 'grid', placeItems: 'end' }}>
                            <button
                                onClick={storeHospital}
                                className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Hospital;