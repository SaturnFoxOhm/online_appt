import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { IoIosAddCircleOutline } from "react-icons/io";

const LabTest = () => {
    const [labTestList, setLabTestList] = useState([]);
    
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

    const handleButtonClick = (labTest) => {
        // Handle button click action here
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
                                            <button className="icon-button" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleButtonClick(labTest)}>
                                                <IoIosAddCircleOutline size={24}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LabTest;