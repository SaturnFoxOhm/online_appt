import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
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
                navigate('/admin/timeslothospital');
            } 
            else if (selectedOption === "timeslotoffsite") {
                console.log('Redirecting...');
                navigate('/admin/timeslotoffsite');
            }
        }
        else {
            console.error('No place selected');
        }
    };

    const storePlaceAdd = () => {
        if (selectedOptionAdd) {
            localStorage.setItem('selectedPlaceAdd', selectedOptionAdd);
            console.log('Selected place stored in local storage:', selectedOptionAdd);

            // Test localStorage
            const testSelectedPlace = localStorage.getItem('selectedPlaceAdd');
            console.log('SelectedPlace from local storage:', testSelectedPlace);

            if (selectedOptionAdd === "timeslothospitaladd") {
                console.log('Redirecting...');
                navigate('/admin/addtimeslothospital');
            } 
            else if (selectedOptionAdd === "timeslotoffsiteadd") {
                console.log('Redirecting...');
                navigate('/admin/addtimeslotoffsite');
            }
        }
        else {
            console.error('No place selected');
        }
    };
    
    return (
        <div>
            <NavbarAdmin />

            <div className="min-h-screen p-6 flex bg-light-yellow">
            <div className="container max-w-screen-md mx-auto">
                <div className="relative">
                </div>

                <div className="rounded shadow-lg p-4 px-4 md:p-6 mb-5">
                    <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-1">
                        <div className="text-gray-600">
                            <p className="font-large text-xl text-black whitespace-normal">
                                Where do you want to edit Time Slot ? / คุณต้องการแก้ไข Time Slot ของที่ไหน ?
                            </p>
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

                <div className="rounded shadow-lg p-4 px-4 md:p-6 mb-5">
                    <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-1">
                        <div className="text-gray-600">
                        <p className="font-large text-xl text-black whitespace-normal">
                            Where do you want to add New Year Time Slot ? / คุณต้องการเพิ่ม Time Slot ของปีใหม่ ของที่ไหน ?
                        </p>
                            <br/>
                            <input type="radio" id="hospitaladd" name="hospitaladd" value="timeslothospitaladd" onChange={handleOptionAddChange} checked={selectedOptionAdd === "timeslothospitaladd"}/>
                            <label for="hospitaladd" style={{ color: "black", marginLeft: "5px" }}>Hospital / เวลาทำงานในโรงพยาบาล</label><br/>
                            <input type="radio" id="offsiteadd" name="offsiteadd" value="timeslotoffsiteadd" onChange={handleOptionAddChange} checked={selectedOptionAdd === "timeslotoffsiteadd"}/>
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