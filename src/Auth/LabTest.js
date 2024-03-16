import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { IoIosAddCircleOutline } from "react-icons/io";

const LabTest = () => {
    const [labTestList, setLabTestList] = useState([]);
    const [showMessage, setShowMessage] = useState(null);
    
    useEffect(() => {
        const fetchLabTestData = async () => {
            try {
                const response = await fetch('http://localhost:5000/LabTest-list', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setLabTestList(data);
                } else {
                    console.error("Failed to fetch LabTest data");
                }
            } catch (error) {
                console.error("Error fetching LabTest data:", error);
            }
        };

        fetchLabTestData();
    }, []);

    const handleButtonClickAdd = async (labTest) => {
        try {
            const response = await fetch('http://localhost:5000/add-labTest', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    TestID: labTest.TestID,
                })
            });
            if (response.ok) {
                // console.error("Add labTest data successful");
                setShowMessage('Added to Cart');
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            } else {
                // console.error("Failed to add labTest data");
                setShowMessage('This test has already been added');
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            }
        } catch (error) {
            // console.error("Error add labTest data:", error);
            setShowMessage('Error adding to cart');
            setTimeout(() => {
                setShowMessage(null);
            }, 1000);
        }
    };
    
    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                    <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `50%` }}> 50 %</div>
                </div>
                <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                    Appoint Health Checkup
                </h2>
                </div>

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-large text-xl text-black whitespace-nowrap">Lab Test</p>
                    <br/>
                    <div>
                        <table className="table-auto mx-auto" style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <tbody>
                                {labTestList.map((labTest, index) => (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFF0DF' : '#FFFFFF' }}>
                                        <td className="border px-4 py-2 text-left relative" style={{ width: '80%', boxSizing: 'border-box' }}>
                                            <div className='name'>
                                                {index + 1}. {labTest.th_name} ({labTest.en_name})
                                            </div>
                                            <div className='specimen'>
                                                Specimen: {labTest.specimen}
                                            </div>
                                            <div className='price'>
                                                Price: {labTest.price}฿
                                            </div>
                                            <button className="icon-button" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleButtonClickAdd(labTest)}>
                                                <IoIosAddCircleOutline size={24}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {showMessage && (
                            <>
                                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-black bg-opacity-75 text-white p-4 shadow-lg rounded-lg flex justify-center items-center flex-col z-50">
                                    <p className="text-sm text-center">{showMessage}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LabTest;