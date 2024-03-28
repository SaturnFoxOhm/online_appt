import Navbar from './navbar';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiDeleteBin6Line } from "react-icons/ri";

const Cart = () => {
    const [packageList, setPackageList] = useState([]);
    const [diseaseList, setDiseaseList] = useState([]);
    const [labTestList, setLabTestList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState();
    const [packageSpecimen, setPackageSpecimen] = useState({});
    const [diseaseSpecimen, setDiseaseSpecimen] = useState({});
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const response = await fetch('http://localhost:5000/CartList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!response.ok) {
                    const errorMessage = await response.text();
                    console.error('Failed to fetch data:', errorMessage);
                    return;
                }
                const { packageCart, diseaseCart, labTestCart } = await response.json();
                setPackageList(packageCart);
                setDiseaseList(diseaseCart);
                setLabTestList(labTestCart);
            } catch (error) {
                console.error("Error fetching Disease data:", error);
            }
        };

        fetchCartData();
    }, []);

    useEffect(() => {
        // Calculate total price whenever selectedItems or packageList changes
        const totalPrice = selectedItems.reduce((acc, selectedItem) => {
            const selectedItemPrice = parseFloat(selectedItem.price) || 0; // Assuming price is a property of selected item
            return acc + selectedItemPrice;
        }, 0);
        setTotalPrice(totalPrice.toFixed(2));
    }, [selectedItems, packageList, diseaseList, labTestList]);

    const handleCheckboxChange = (item) => {
        setSelectedItems(prevItems => {
            if (prevItems.includes(item)) {
                return prevItems.filter(prevItem => prevItem !== item);
            } else {
                return [...prevItems, item];
            }
        });
    };

    const handleDeleteItemClick = async (delItem) => {
        // console.log(delItem);
        try {
            const requestBody = {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: {}
            };

            if ('PackageID' in delItem) {
                requestBody.body = JSON.stringify({
                    itemType: "Package",
                    itemID: delItem.PackageID
                });
            }
            else if ('DiseaseID' in delItem) {
                requestBody.body = JSON.stringify({
                    itemType: "Disease",
                    itemID: delItem.DiseaseID
                });
            }
            else if ('TestID' in delItem) {
                requestBody.body = JSON.stringify({
                    itemType: "LabTest",
                    itemID: delItem.TestID
                });
            }

            const response = await fetch('http://localhost:5000/del-CartList', requestBody);

            if (response.ok) {
                console.error("Delete list in cart successful");

                if ('PackageID' in delItem) {
                    setPackageList(prevPackageList => prevPackageList.filter(packageItem => packageItem.PackageID !== delItem.PackageID));
                } else if ('DiseaseID' in delItem) {
                    setDiseaseList(prevDiseaseList => prevDiseaseList.filter(diseaseItem => diseaseItem.DiseaseID !== delItem.DiseaseID));
                } else if ('TestID' in delItem) {
                    setLabTestList(prevLabTestList => prevLabTestList.filter(labTestItem => labTestItem.TestID !== delItem.TestID));
                }

                setSelectedItems(prevItems => prevItems.filter(item => item !== delItem));

                const totalPrice = selectedItems.reduce((acc, selectedItem) => {
                    const selectedItemPrice = parseFloat(selectedItem.price) || 0;
                    return acc + selectedItemPrice;
                }, 0);
                setTotalPrice(totalPrice);

            } else {
                console.error("Failed to delete list in cart");
                console.error("Status code:", response.status);
                console.error("Status text:", response.statusText);
            }
        } catch (error) {
            console.error("Error delete list in cart data:", error);
        }
    };

    const fetchPackageSpecimen = async (packageID) => {
        try {
            const response = await fetch('http://localhost:5000/Package-details', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    PackageID: packageID,
                })
            });
            if (response.ok) {
                const data = await response.json();
                let allSpecimen = '';
                data.forEach(detail => {
                    if (!allSpecimen.includes(detail.specimen)) {
                        allSpecimen += detail.specimen + '/';
                    }
                });
                return allSpecimen.slice(0, -1); // Remove trailing
            }
        } catch (error) {
            console.error("Error fetch details list:", error);
        }
        return '';
    };

    useEffect(() => {
        // Fetch package specimen for each package in the packageList
        const PackageSpecimens = async () => {
            const promises = packageList.map(packageItem => fetchPackageSpecimen(packageItem.PackageID));
            Promise.all(promises).then(specimens => {
                const specimenMap = {};
                specimens.forEach((specimen, index) => {
                    specimenMap[packageList[index].PackageID] = specimen;
                });
                setPackageSpecimen(specimenMap);
            });
        };

        PackageSpecimens();
    }, [packageList]);

    const fetchDiseaseSpecimen = async (diseaseID) => {
        try {
            const response = await fetch('http://localhost:5000/Disease-details', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    DiseaseID: diseaseID,
                })
            });
            if (response.ok) {
                const data = await response.json();
                let allSpecimen = '';
                data.forEach(detail => {
                    if (!allSpecimen.includes(detail.specimen)) {
                        allSpecimen += detail.specimen + '/';
                    }
                });
                return allSpecimen.slice(0, -1); // Remove trailing
            }
        } catch (error) {
            console.error("Error fetch details list:", error);
        }
        return '';
    };

    useEffect(() => {
        const DiseaseSpecimens = async () => {
            const promises = diseaseList.map(diseaseItem => fetchDiseaseSpecimen(diseaseItem.DiseaseID));
            Promise.all(promises).then(specimens => {
                const specimenMap = {};
                specimens.forEach((specimen, index) => {
                    specimenMap[diseaseList[index].DiseaseID] = specimen;
                });
                setDiseaseSpecimen(specimenMap);
            });
        };

        DiseaseSpecimens();
    }, [diseaseList]);

    const handleSelectAll = () => {
        if (selectedItems.length === packageList.length + diseaseList.length + labTestList.length) {
            // If all items are already selected, deselect all items
            setSelectedItems([]);
        } else {
            // Otherwise, select all items
            const allItems = [...packageList, ...diseaseList, ...labTestList];
            setSelectedItems(allItems);
        }
    };

    const storeOrder = async () => {
        if (totalPrice && selectedItems.length > 0) {
            localStorage.setItem('totalPrice', totalPrice);
            console.log('totalPrice stored in local storage:', totalPrice);

            // Test localStorage
            const testTotalPrice = localStorage.getItem('totalPrice');
            console.log('totalPrice from local storage:', testTotalPrice);

            // Add to Orders
            try {
                const itemsToSend = selectedItems.map(item => {
                    let itemType, itemID, specimen;
                    if ('PackageID' in item) {
                        itemType = "Package";
                        itemID = item.PackageID;
                        specimen = packageSpecimen[item.PackageID];
                    } else if ('DiseaseID' in item) {
                        itemType = "Disease";
                        itemID = item.DiseaseID;
                        specimen = diseaseSpecimen[item.DiseaseID];
                    } else if ('TestID' in item) {
                        itemType = "LabTest";
                        itemID = item.TestID;
                        specimen = item.specimen; // Assuming specimen is a property of lab test item
                    }
                    return { itemType, itemID, specimen };
                });

                const response = await fetch('http://localhost:5000/Orders', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        totalPrice: totalPrice,
                        selectedItems: itemsToSend
                    })
                });
                if (response.ok) {
                    console.log("Items added to orders successfully");
                    navigate('/user/appoint');
                } else {
                    console.error("Failed to add items to orders");
                    console.error("Status code:", response.status);
                    console.error("Status text:", response.statusText);
                }
            } catch (error) {
                console.error("Error adding items to orders:", error);
            }
        }
        else {
            console.error('No total price or no items selected');
            alert("Please select at least one of the test lists.");
            return;
        }
    };
    
    return(
        <div>
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
            <div className="container max-w-screen-lg mx-auto">
                <div className="bg-white rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                    <p className="font-large text-xl text-black whitespace-nowrap mb-6 font-bold">Cart / ตะกร้า</p>  
                    <div style={{ paddingLeft: '20px', textAlign: 'left' }}>
                        <p>รายการตรวจ</p>
                        
                        {packageList.length > 0 && (
                            <div className='PackageCart'>
                                <p style={{ borderBottom: '1px solid lightgray', paddingBottom: '10px', marginBottom: '10px', fontWeight: 'bold' }}>Package</p>
                                {packageList && packageList.map((packages, index) => (
                                    <div key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="flex items-center">
                                            <input type="checkbox" checked={selectedItems.includes(packages)} onChange={() => handleCheckboxChange(packages)} className="mr-2" />
                                            <div className="flex flex-col">
                                                <p>{packages.th_package_name} ({packages.en_package_name})</p>
                                                <p>สิ่งส่งตรวจ: {packageSpecimen[packages.PackageID]}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <p>{packages.price}</p>
                                            <RiDeleteBin6Line
                                                style={{ marginLeft: '20px', cursor: 'pointer' }}
                                                onClick={() => handleDeleteItemClick(packages)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <br/>
                        {diseaseList.length > 0 && (
                            <div className='DiseaseCart'>
                                <p style={{ borderBottom: '1px solid lightgray', paddingBottom: '10px', marginBottom: '10px', fontWeight: 'bold' }}>Disease</p>
                                {diseaseList && diseaseList.map((disease, index) => (
                                    <div key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="flex items-center">
                                            <input type="checkbox" checked={selectedItems.includes(disease)} onChange={() => handleCheckboxChange(disease)} className="mr-2"/>
                                            <div className="flex flex-col">
                                                <p>{disease.th_name} ({disease.en_name})</p>
                                                <p>สิ่งส่งตรวจ: {diseaseSpecimen[disease.DiseaseID]}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <p>{disease.price}</p>
                                            <RiDeleteBin6Line
                                                style={{ marginLeft: '20px', cursor: 'pointer' }}
                                                onClick={() => handleDeleteItemClick(disease)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <br/>
                        {labTestList.length > 0 && (
                            <div className='LabTestCart'>
                            <p style={{ borderBottom: '1px solid lightgray', paddingBottom: '10px', marginBottom: '10px', fontWeight: 'bold' }}>Lab Test</p>
                                {labTestList && labTestList.map((labTest, index) => (
                                    <div key={index} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="flex items-center">
                                            <input type="checkbox" checked={selectedItems.includes(labTest)} onChange={() => handleCheckboxChange(labTest)} className="mr-2"/>
                                            <div className="flex flex-col">
                                                {/* <span>{labTest.th_name}</span> */}
                                                {labTest.NHSO === 1 && <span style={{ marginLeft: '5px' }}>
                                                    <span>{labTest.th_name}</span>
                                                    <span style={{ color: '#017045' }}> NHSO✓</span>
                                                </span>}
                                                {labTest.main5Test === 1 && <span style={{marginLeft: '5px' }}>
                                                    <span>{labTest.th_name}</span>
                                                    <span style={{ color: '#017045' }}> main5Test✓</span>
                                                </span>}
                                                <p style={{ marginLeft: '5px' }}>สิ่งส่งตรวจ: {labTest.specimen}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <p>{labTest.price}</p>
                                            <RiDeleteBin6Line
                                                style={{ marginLeft: '20px', cursor: 'pointer' }}
                                                onClick={() => handleDeleteItemClick(labTest)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {packageList.length === 0 && diseaseList.length === 0 && labTestList.length === 0 && (
                            <div style={{ textAlign: 'center', color: 'gray'}}>
                                <p>Your cart is empty. ตะกร้าว่างเปล่า</p>
                            </div>
                        )}
                        <br/>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedItems.length === packageList.length + diseaseList.length + labTestList.length}
                                    onChange={() => handleSelectAll()}
                                    className='mr-2'
                                />
                                <label>Select All / เลือกทั้งหมด</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div>
                                    Total Price / ราคารวม: ฿{totalPrice}
                                </div>
                                <button
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out ml-4"
                                    onClick={storeOrder}
                                >
                                    Checkout / เช็คเอาท์
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Cart;