import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { IoIosAddCircleOutline } from "react-icons/io";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RxCrossCircled } from "react-icons/rx";
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

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
                setShowMessage(
                    <span>
                        Added to Cart{' '}
                        <FontAwesomeIcon icon={faCartShopping} style={{ color: "#ffffff", fontSize: "1.5em" }} />
                    </span>);
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            } else {
                // console.error("Failed to add labTest data");
                setShowMessage(
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                        Can't Add to Cart{' '}
                        <RxCrossCircled style={{ color: 'red', fontSize: '2em', marginLeft: '5px' }} />
                    </span>);
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

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-large text-xl text-black whitespace-nowrap">Lab Test / การทดสอบในห้องปฏิบัติการ</p>
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
                                                Price: {new Intl.NumberFormat('en-US').format(labTest.price)}฿
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