import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { format, isBefore, isToday, addDays } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useNavigate } from 'react-router-dom';

const DateTime = () => {
    const [selectedDate, setSelectedDate] = useState(undefined);
    const [timeslot, setTimeslot] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        if (selectedDate) {
            setError('');
            fetchTimeSlot();
        }
    }, [selectedDate]);

    const fetchTimeSlot = async () => {
        try {
            const selectedHospital = localStorage.getItem('selectedHospital');
            const selectedPlace = localStorage.getItem('selectedPlace');

            var year = selectedDate.getFullYear();
            var month = selectedDate.getMonth() + 1;
            var date = selectedDate.getDate();

            var formattedDate = year + '-' + (month < 10 ? '0' + month : month) + '-' + (date < 10 ? '0' + date : date);

            const response = await fetch('http://localhost:5000/fetchTimeSlot', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedHospital: selectedHospital,
                    selectedDate: formattedDate,
                    selectedPlace: selectedPlace
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setTimeslot(data);
                localStorage.setItem('selectedDate', formattedDate);
            } else {
                console.error("Failed to fetch Time Slot data");
            }
        } catch (error) {
            console.error("Error fetching Time Slot:", error);
        }
    };

    const showSelectedDate = selectedDate ? (
        <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mt-5 flex items-center justify-between">
            <p className="font-large text-xl text-black">{format(selectedDate, 'PP')}.</p>
        </div>
    ) : (
        <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mt-5 flex items-center justify-between">
            <p className="font-large text-xl text-black">Please pick a day. / กรุณาเลือกวันที่</p>
        </div>
    );

    const handleDayClick = (day) => {
        setSelectedDate(day);
        fetchTimeSlot(day);
    };

    const handleSlotChange = (event) => {
        setSelectedSlot(event.target.value);
    };

    const storeDateTime = () => {
        if (!selectedDate) {
            alert('Please select a date.');
        } else if (!selectedSlot) {
            alert('Please select a time slot.');
        } else if (isBefore(selectedDate, new Date()) || isToday(selectedDate)) {
            alert('Please select a date after today.');
        } else if (selectedSlot) {
            localStorage.setItem('selectedSlot', selectedSlot);
            console.log('Selected slot stored in local storage:', selectedSlot);
            navigate('/user/confirmation');
        } else {
            console.error('No Slot selected');
        }
    };

    // Use to disable date before today
    const today = new Date();
    const isDateSelectable = (date) => isBefore(date, today);

    return (
        <div className="calendar">
            <Navbar />

            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
                <div className="container max-w-screen-md mx-auto">
                    <div className="relative">
                        <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                            <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `50%` }}> 50 %</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                        <div
                            style={{
                                backgroundColor: '#F3F4F6',
                                padding: '20px',
                                borderRadius: '8px',
                            }}
                        >
                            <p className="font-large text-xl text-black whitespace-nowrap">Select Date / Time (กรุณาเลือกวัน และ เวลา ที่ท่านต้องการ)</p>
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <DayPicker
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                    onDayClick={handleDayClick}
                                    disabled={isDateSelectable}
                                    classNames={{
                                        selected: 'bg-green-500 text-white',
                                    }}
                                />
                            </div>
                            {showSelectedDate}
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                        </div>

                        <div
                            style={{
                                backgroundColor: '#F3F4F6',
                                padding: '20px',
                                borderRadius: '8px',
                            }}
                        >
                            <select
                                value={selectedSlot}
                                onChange={handleSlotChange}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                }}
                            >
                                <option value="">Select a time slot / กรุณาเลือกช่วงเวลา</option>
                                {timeslot &&
                                    timeslot.map((slot, index) => (
                                        <option key={index} value={slot.hosSlotID || slot.offSlotID}>
                                            {`${slot.start_time.slice(0, 5)}-${slot.end_time.slice(0, 5)}`}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                            <button
                                onClick={storeDateTime}
                                className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Next / ต่อไป
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DateTime;
