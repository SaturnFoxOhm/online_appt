import Navbar from './navbar';
import React, { useState, useEffect } from 'react';
import { FaRegCalendarCheck } from "react-icons/fa";

const SuccessAppointment = () => {  
    const [appointmentData, setAppointmentData] = useState();

    useEffect(() => {
        localStorage.removeItem('totalPrice');
        localStorage.removeItem('InfoID');
        localStorage.removeItem('selectedPlace');
        localStorage.removeItem('selectedHospital');
        localStorage.removeItem('selectedDate');
        localStorage.removeItem('selectedSlot');
    }, []);

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const response = await fetch('http://localhost:5000/success-appoint', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                });
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error('Failed to fetch data:', errorMessage);
                    return;
                }
                const { hospital, timeslot } = await response.json();
                const data = {
                    hospital: hospital,
                    DateTime: timeslot,
                };
                setAppointmentData(data);
                console.log(appointmentData.hospital[0].hos_name);
                console.log(appointmentData.DateTime[0].HospitalDate);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAppointmentDetails();
    }, []);

    const formatDate = (datetimeString) => {
        const date = new Date(datetimeString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };
    
    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                    <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `100%` }}> 100 %</div>
                </div>
                </div>

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <div style={{ textAlign: 'center', color: '#017045', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <FaRegCalendarCheck size={90}/>
                        <br/>
                        <p className="font-large text-xl whitespace-nowrap" style={{ fontWeight: '600' }}>Appointment Successfully ! / การนัดหมายสำเร็จ !</p>
                    </div>
                    <br/>
                    <div className='details'>
                        {appointmentData && appointmentData.hospital &&(
                            <div>
                                <p>{appointmentData.hospital[0].hos_name}</p>
                            </div>
                        )}
                        {appointmentData && appointmentData.DateTime && (
                            <div>
                                {appointmentData.DateTime[0].HospitalDate ? (
                                    <p>{formatDate(appointmentData.DateTime[0].HospitalDate)}</p>
                                ) : (
                                    <p>{formatDate(appointmentData.DateTime[0].OffSiteDate)}</p>
                                )}
                                <p>{appointmentData.DateTime[0].start_time.trim().slice(0, -3)}-{appointmentData.DateTime[0].end_time.trim().slice(0, -3)}</p>
                                <br/>
                            </div>
                        )}
                    </div>
                    <a href="/user/appointmentlist">
                        <button
                            style={{
                                backgroundColor: '#017045',
                                color: 'white',
                                padding: '10px 50px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                borderRadius: '10px',
                            }}
                            onMouseOver={(e) => { e.target.style.backgroundColor = '#54D388'; }}
                            onMouseOut={(e) => { e.target.style.backgroundColor = '#017045'; }}
                        >
                            My Appointments / การจองของฉัน
                        </button>
                    </a>
                </div>
            </div>
            </div>
        </div>
    );
};

export default SuccessAppointment;