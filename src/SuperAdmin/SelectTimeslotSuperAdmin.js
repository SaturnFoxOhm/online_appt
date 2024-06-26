import React, { useState, useEffect } from 'react';
import NavbarSuperAdmin from './NavbarSuperAdmin';
import { Link, useNavigate } from 'react-router-dom';

const PlaceAdmin = () => {
    const [selectedOption, setSelectedOption] = useState('');
    const [selectedOptionAdd, setSelectedOptionAdd] = useState('');
    const navigate = useNavigate();

    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleOptionAddChange = (event) => {
        setSelectedOptionAdd(event.target.value);
    };

    const storePlace = () => {
        if (selectedOption) {
            localStorage.setItem('selectedPlace', selectedOption);
            console.log('Selected place stored in local storage:', selectedOption);

            // Test localStorage
            const testSelectedPlace = localStorage.getItem('selectedPlace');
            console.log('SelectedPlace from local storage:', testSelectedPlace);

            if (selectedOption === "timeslothospital") {
                console.log('Redirecting...');
                navigate('/super-admin/timeslothospital');
            } 
            else if (selectedOption === "timeslotoffsite") {
                console.log('Redirecting...');
                navigate('/super-admin/timeslotoffsite');
            }
        }
        else {
            console.error('No place selected');
        }
    };

    const storePlaceAdd = () => {
        if (selectedOptionAdd) {
            localStorage.setItem('selectedPlace', selectedOptionAdd);
            console.log('Selected place stored in local storage:', selectedOptionAdd);

            // Test localStorage
            const testSelectedPlace = localStorage.getItem('selectedPlace');
            console.log('SelectedPlace from local storage:', testSelectedPlace);

            if (selectedOptionAdd === "addtimeslothospital") {
                console.log('Redirecting...');
                navigate('/super-admin/addtimeslothospital');
            } 
            else if (selectedOptionAdd === "addtimeslotoffsite") {
                console.log('Redirecting...');
                navigate('/super-admin/addtimeslotoffsite');
            }
        }
        else {
            console.error('No place selected');
        }
    };
    
    return (
        <div>
            <NavbarSuperAdmin />

            <div className="min-h-screen p-6 bg-light-yellow flex">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                    {/* <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                        <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `20%` }}> 20 %</div>
                    </div> */}
                </div>

                <div className="bg-white rounded shadow-lg p-4 px-4 md:p-6 mb-5">
                    <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-1">
                        <div className="text-gray-600">
                            <p className="font-large text-xl text-black whitespace-normal">Where do you want to edit Time Slot ? / คุณต้องการแก้ไข Time Slot ของที่ไหน ?</p>
                            <br/>
                            <input type="radio" id="hospital" name="hospital" value="timeslothospital" onChange={handleOptionChange} checked={selectedOption === "timeslothospital"}/>
                            <label for="hospital" style={{ color: "black", marginLeft: "5px" }}>Hospital / เวลาทำงานในโรงพยาบาล</label><br/>
                            <input type="radio" id="offsite" name="offsite" value="timeslotoffsite" onChange={handleOptionChange} checked={selectedOption === "timeslotoffsite"}/>
                            <label for="offsite" style={{ color: "black", marginLeft: "5px" }}>Off-site / เวลาทำงานนอกสถานที่</label><br/>
                        </div>

                        <div style={{ display: 'grid', placeItems: 'end' }}>
                            <button 
                            onClick={storePlace}
                            className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                            Next / ต่อไป
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded shadow-lg p-4 px-4 md:p-6 mb-5">
                    <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-1">
                        <div className="text-gray-600">
                            <p className="font-large text-xl text-black whitespace-normal">Where do you want to add New Year Time Slot  / คุณต้องการเพิ่ม Time Slot ของปีใหม่ ของที่ไหน ?</p>
                            <br/>
                            <input type="radio" id="hospitaladd" name="hospitaladd" value="addtimeslothospital" onChange={handleOptionAddChange} checked={selectedOptionAdd === "addtimeslothospital"}/>
                            <label for="hospitaladd" style={{ color: "black", marginLeft: "5px" }}>Hospital / เวลาทำงานในโรงพยาบาล</label><br/>
                            <input type="radio" id="offsiteadd" name="offsiteadd" value="addtimeslotoffsite" onChange={handleOptionAddChange} checked={selectedOptionAdd === "addtimeslotoffsite"}/>
                            <label for="offsiteadd" style={{ color: "black", marginLeft: "5px" }}>Off-site / เวลาทำงานนอกสถานที่</label><br/>
                        </div>

                        <div style={{ display: 'grid', placeItems: 'end' }}>
                            <button 
                            onClick={storePlaceAdd}
                            className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                            Next / ต่อไป
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
};

export default PlaceAdmin;