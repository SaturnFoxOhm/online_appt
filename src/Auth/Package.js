import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { IoIosAddCircleOutline, IoIosList } from "react-icons/io";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RxCrossCircled } from "react-icons/rx";
import { faCartShopping } from '@fortawesome/free-solid-svg-icons';

const Package = () => {
    const [packageList, setPackageList] = useState([]);
    const [showMessage, setShowMessage] = useState(null);
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchPackageData = async () => {
            try {
                const response = await fetch('http://localhost:5000/Package-list', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setPackageList(data);
                } else {
                    console.error("Failed to fetch Package data");
                }
            } catch (error) {
                console.error("Error fetching Package data:", error);
            }
        };

        fetchPackageData();
    }, []);

    const handleButtonClickList = (packages) => {        
        navigate(`/user/Package/${packages.PackageID}`, { state: { packages } });
    };

    const handleButtonClickAdd = async (packages) => {        
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
                setShowMessage(
                <span>
                    Added to Cart{' '}
                    <FontAwesomeIcon icon={faCartShopping} style={{ color: "#ffffff", fontSize: "1.5em" }} />
                </span>);
                setTimeout(() => {
                    setShowMessage(null);
                }, 1000);
            } else {
                // console.error("Failed to add package data");
                setShowMessage(
                <span>
                    Cannot Add to Cart{' '}
                    <RxCrossCircled style={{ color: 'red', fontSize: "1.5em" }} />
                </span>);
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
    
    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-md mx-auto">

                <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-large text-xl text-black whitespace-nowrap">Package / แพ็กเกจ</p>
                    <br/>
                    <div>
                        <table className="table-auto mx-auto" style={{ borderCollapse: 'collapse', width: '100%' }}>
                            <tbody>
                                {packageList.map((packages, index) => (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#FFF0DF' : '#FFFFFF' }}>
                                        <td className="border px-4 py-2 text-left relative" style={{ width: '80%', boxSizing: 'border-box' }}>
                                            <div className='name'>
                                                {index + 1}. {packages.th_package_name} ({packages.en_package_name})
                                            </div>
                                            <div className='price'>
                                                Price: {packages.price}฿
                                            </div>
                                            <button className="icon-button" style={{ position: 'absolute', right: '60px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleButtonClickList(packages)}>
                                                <IoIosList size={24}/>
                                            </button>
                                            <button className="icon-button" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} onClick={() => handleButtonClickAdd(packages)}>
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

export default Package;