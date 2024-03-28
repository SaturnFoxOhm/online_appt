import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './navbar';
import { IoIosAddCircleOutline } from "react-icons/io";

const PackageDetail = () => {
    const location = useLocation();
    const [showMessage, setShowMessage] = useState(null);
    const { packages } = location.state;

    const [packagesDetails, setPackagesDetails] = useState([]);

    useEffect(() => {
        const fetchPackagesDetails = async () => {
            try {
                const response = await fetch('http://localhost:5000/Package-details', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        PackageID: packages.PackageID,
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    setPackagesDetails(data);
                } else {
                    console.error("Failed to fetch packages details");
                }
            } catch (error) {
                console.error("Error fetching packages details:", error);
            }
        };

        fetchPackagesDetails();
    }, []);


    const PackageSpecimen = () => {
        if (!packagesDetails || packagesDetails.length === 0) {
            return "Loading...";
        }

        let AllSpecimen = packagesDetails[0].specimen;
        packagesDetails.forEach(detail => {
            if (!AllSpecimen.includes(detail.specimen)) {
                AllSpecimen += '/' + detail.specimen;
            }
        });
        return AllSpecimen;
    };

    const handleButtonClickAdd = async (disease) => {        
        try {
            const response = await fetch('http://localhost:5000/add-package', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    PackageID: packages.PackageID,
                })
            });
            if (response.ok) {
                // console.error("Add package data successful");
                setShowMessage('Added to Cart');
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            } else {
                // console.error("Failed to add package data");
                setShowMessage('Cannot Add to Cart');
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            }
        } catch (error) {
            // console.error("Error add package data:", error);
            setShowMessage('Error adding to cart');
            setTimeout(() => {
                setShowMessage(null);
            }, 1000);
        }
    };

    return (
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-large text-xl text-black whitespace-nowrap">{packages.th_package_name}</p>
                    <p className="font-large text-xl text-black whitespace-nowrap">{packages.en_package_name}</p>
                    <br/>
                    <div style={{ paddingLeft: '20px', textAlign: 'left' }}>
                        <p>รายละเอียด</p>
                        <ul>
                            {packagesDetails.map((detail, index) => (
                                <li key={detail.TestID}>
                                    &bull; {detail.th_name} ({detail.en_name})
                                </li>
                            ))}
                        </ul>
                        <br/>
                        <div className='specimen'>
                            สิ่งส่งตรวจ: {PackageSpecimen()}
                        </div>
                        <div className='price'>
                            ราคา: {packages.price}฿
                        </div>
                        <div style={{ width: '80%', margin: '0 auto', marginTop: '20px', textAlign: 'center' }}>
                            <button className="icon-button" onClick={() => handleButtonClickAdd(packages)} 
                                style={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%', 
                                    padding: '10px 0', 
                                    backgroundColor: '#017045', 
                                    color: 'white', 
                                    border: 'none', 
                                    borderRadius: '5px', 
                                    cursor: 'pointer',
                                    transition: 'background-color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#54D388'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#017045'}
                            >
                                
                                <span>Add to cart</span>
                                <IoIosAddCircleOutline size={24} style={{ marginLeft: '5px' }}/>
                            </button>
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
        </div>
    );
};

export default PackageDetail;