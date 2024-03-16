import Navbar from './navbar';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Confirmation = () => {
    const [appointmentData, setAppointmentData] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const response = await fetch('http://localhost:5000/appointment-info', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        InfoID: localStorage.getItem('InfoID'),
                        selectedSlot: localStorage.getItem('selectedSlot'),
                        selectedHospital: localStorage.getItem('selectedHospital'),
                        selectedDate: localStorage.getItem('selectedDate'),
                        selectedPlace: localStorage.getItem('selectedPlace')
                    }),
                });
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error('Failed to fetch data:', errorMessage);
                    return;
                }
                const { userInfo, hospital, Address, DateTime, PackageOrders, DiseaseOrders, LabTestOrders } = await response.json();
                console.log(PackageOrders);
                console.log(DiseaseOrders);
                console.log(LabTestOrders);

                const combinedSpecimens = combineSpecimens(PackageOrders, DiseaseOrders, LabTestOrders);

                const data = {
                    userInfo: userInfo,
                    hospital: hospital,
                    Address: Address,
                    DateTime: DateTime,
                    PackageOrders: PackageOrders,
                    DiseaseOrders: DiseaseOrders,
                    LabTestOrders: LabTestOrders,
                    AllSpecimens: combinedSpecimens
                };

                setAppointmentData(data);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAppointmentDetails();
    }, []);

    const formatDate = (datetimeString) => {
        const date = new Date(datetimeString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

    const getSexLabel = (sexCode) => {
        return sexCode === 'F' ? 'Female' : sexCode === 'M' ? 'Male' : 'Unknown';
    };

    const combineSpecimens = (packageOrders, diseaseOrders, labTestOrders) => {
        let allSpecimens = new Set();
    
        const addToSpecimens = (specimens) => {
            specimens.forEach(specimen => {
                if (!allSpecimens.has(specimen)) {
                    allSpecimens.add(specimen);
                }
            });
        };
    
        if (packageOrders) {
            packageOrders.forEach(order => {
                if (order.specimen) {
                    const specimens = order.specimen.split('/');
                    addToSpecimens(specimens);
                }
            });
        }
    
        if (diseaseOrders) {
            diseaseOrders.forEach(order => {
                if (order.specimen) {
                    const specimens = order.specimen.split('/');
                    addToSpecimens(specimens);
                }
            });
        }
    
        if (labTestOrders) {
            labTestOrders.forEach(order => {
                if (order.specimen) {
                    const specimens = order.specimen.split('/');
                    addToSpecimens(specimens);
                }
            });
        }
    
        return [...allSpecimens].join('/');
    };
    
    const confirmAppointment = async () => {
        try {
            const response = await fetch('http://localhost:5000/confirm-appointment', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    InfoID: localStorage.getItem('InfoID'),
                    selectedHospital: localStorage.getItem('selectedHospital'),
                    selectedDate: localStorage.getItem('selectedDate'),
                    selectedSlot: localStorage.getItem('selectedSlot'),
                    selectedPlace: localStorage.getItem('selectedPlace'),
                    totalPrice: localStorage.getItem('totalPrice'),
                })
            });
            if (response.ok) {
                console.log("Confirm Appointment successfully");
                navigate('/user/payment');
            } else {
                console.error("Failed to Confirm Appointment");
                console.error("Status code:", response.status);
                console.error("Status text:", response.statusText);
            }
        } catch (error) {
            console.error("Error Confirm Appointment:", error);
        }
    };
    
    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                    <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `70%` }}> 70 %</div>
                </div>
                <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                    Appoint Health Checkup
                </h2>
                </div>

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-bold font-large text-xl text-black whitespace-nowrap mb-4">Appointment Confirmation</p>
                    <div>
                        {appointmentData && appointmentData.userInfo &&(
                            <div className="mb-4">
                             {/* Personal Information */}
                                <p className="font-semibold text-lg">Personal Information</p>
                                    <li>Personal ID: {appointmentData.userInfo[0]?.InfoID}</li>
                                    <li>Name: {appointmentData.userInfo[0]?.first_name} {appointmentData.userInfo[0]?.last_name}</li>
                                    <li>Birthday: {formatDate(appointmentData.userInfo[0]?.birthday)}</li>
                                    <li>Sex: {getSexLabel(appointmentData.userInfo[0]?.sex)}</li>
                                    <li>Phone: {appointmentData.userInfo[0]?.phone}</li>
                                    <li>Weight: {appointmentData.userInfo[0]?.weight || "-"}</li>
                                    <li>Height: {appointmentData.userInfo[0]?.height || "-"}</li>
                                    <li>Allergy: {appointmentData.userInfo[0]?.allergic || "-"}</li>
                                    <li>Congenital Disease: {appointmentData.userInfo[0]?.congenital_disease || "-"}</li>
                                    <li>Email: {appointmentData.userInfo[0]?.email}</li>
                            </div>
                        )}
                        {appointmentData && (
                            <div className="mb-4">
                                <p className="font-semibold text-lg">Hospital</p>
                                <p>{appointmentData.hospital[0].hos_name}</p>
                            </div>
                        )}
                        {appointmentData && appointmentData.Address && (
                        <div className="mb-4">
                            <p className="font-semibold text-lg">Address</p>
                            <p>
                            {`${appointmentData.Address[0].ad_line1}${appointmentData.Address[0].ad_line2 !== "" ? `, ${appointmentData.Address[0].ad_line2}` : ''}, ${appointmentData.Address[0].city}, ${appointmentData.Address[0].province}, ${appointmentData.Address[0].zipcode}`}
                            </p>
                        </div>
                        )}
                        {appointmentData && appointmentData.DateTime && (
                            <div className="mb-4">
                                <p className="font-semibold text-lg">Date/Time</p>
                                <p>{formatDate(appointmentData.DateTime[0].HospitalDate)} {appointmentData.DateTime[0].start_time.trim().slice(0, -3)}-{appointmentData.DateTime[0].end_time.trim().slice(0, -3)}</p>
                            </div>
                        )}
                        {appointmentData && (
                            <div className="mb-4">
                                <p className="font-semibold text-lg">Test List</p>
                                    {appointmentData.PackageOrders && appointmentData.PackageOrders.map((order, index) => (
                                        <div key={`package_order_${index}`} className='mb-2'>
                                            <p className='mb-1'>&bull; {order.th_package_name}</p>
                                            {/* Add the following line if you want to display only the English package name */}
                                            <p>({order.en_package_name})</p>
                                        </div>
                                    ))}
                                    {appointmentData.DiseaseOrders && appointmentData.DiseaseOrders.map((order, index) => (
                                        <li className='mb-2' key={`disease_order_${index}`}>&bull; {order.th_name} ({order.en_name})</li>
                                    ))}
                                    {appointmentData.LabTestOrders && appointmentData.LabTestOrders.map((order, index) => (
                                        <li className='mb-2' key={`lab_test_order_${index}`}>&bull; {order.th_name} ({order.en_name})</li>
                                    ))}
                            </div>
                        )}
                        <div className="mb-4">
                            <p className="font-semibold text-lg">Specimen</p>
                            {appointmentData && appointmentData.AllSpecimens && (
                                <p>{appointmentData.AllSpecimens}</p>
                            )}
                        </div>
                        <button
                            className="mt-2 mb-1 text-lg bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out"
                            onClick={confirmAppointment}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Confirmation;