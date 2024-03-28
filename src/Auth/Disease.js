import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { IoIosAddCircleOutline, IoIosList } from "react-icons/io";

const Disease = () => {
    const [diseaseList, setDiseaseList] = useState([]);
    const [showMessage, setShowMessage] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchDiseaseData = async () => {
            try {
                const response = await fetch('http://localhost:5000/Disease-list', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setDiseaseList(data);
                } else {
                    console.error("Failed to fetch Disease data");
                }
            } catch (error) {
                console.error("Error fetching Disease data:", error);
            }
        };

        fetchDiseaseData();
    }, []);

    const handleButtonClickList = (disease) => {
        navigate(`/user/Disease/${disease.DiseaseID}`, { state: { disease } });
    };

    const handleButtonClickAdd = async (disease) => {        
        try {
            const response = await fetch('http://localhost:5000/add-disease', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    DiseaseID: disease.DiseaseID,
                })
            });
            if (response.ok) {
                // console.error("Add disease data successful");
                setShowMessage('Added to Cart');
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            } else {
                // console.error("Failed to add disease data");
                setShowMessage('Cannot Add to Cart');
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            }
        } catch (error) {
            // console.error("Error add disease data:", error);
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
                    <p className="font-large text-xl text-black whitespace-nowrap">Specific Disease / โรคเฉพาะ</p>
                    <br/>
                    <div>
                        <table className="table-auto mx-auto" style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <tbody>
                                {diseaseList.map((disease, index) => (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFF0DF' : '#FFFFFF' }}>
                                        <td className="border px-4 py-2 text-left relative" style={{ width: '80%', boxSizing: 'border-box' }}>
                                            <div className='name'>
                                                {index + 1}. {disease.th_name} ({disease.en_name})
                                            </div>
                                            <div className='price'>
                                                Price: {disease.price}฿
                                            </div>
                                            <button className="icon-button" style={{ position: 'absolute', right: '60px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleButtonClickList(disease)}>
                                                <IoIosList size={24}/>
                                            </button>
                                            <button className="icon-button" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleButtonClickAdd(disease)}>
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

export default Disease;