import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
import { useNavigate, Link } from 'react-router-dom';

const TimeslotHospitalAdmin = () => {
    const [timeslot, setTimeslot] = useState([]);
    const [selectedDate, setSelectedDate] = useState([]);
    const navigate = useNavigate(); // Hook to navigate programmatically

    const handleDateChange = (event) => {
        const date = event.target.value;
        setSelectedDate(date);
    };

    const handleSubmitDate = async () => {
        const currentselectedDate = {
            selectedDate: selectedDate,
        };
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/admin-get-timeslothospital', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
                    },
                    body: JSON.stringify(currentselectedDate),
                });
                const data = await response.json();
                setTimeslot(data.time_slot);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:5000/admin-get-timeslot', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
                    },
                });
                const data = await response.json();
                setTimeslot(data.time_slot);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <div>
            <NavbarAdmin />
            <div className="min-h-screen p-6 flex bg-light-yellow">
                <div className="container max-w-screen-lg mx-auto">
                    <div className="relative">
                    </div>

                    <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto w-1/4">
                        <p className="font-medium text-lg text-black">Choose Date / เลือกวัน</p>
                        <input type="date" onChange={handleDateChange} min={new Date().toISOString().split('T')[0]} />
                        <div className="md:col-span-4 text-right">
                            <div className="inline-flex items-end">
                                <button onClick={handleSubmitDate} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Submit / ส่ง</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
                            <div className="text-gray-600">
                                <p className="font-medium text-lg text-black">Hospital's Time Slots / ช่วงเวลาทำงานในโรงพยาบาล</p>
                                <p>Selected Date / วันที่เลือก: {selectedDate}</p>
                            </div>
                            <div className="lg:col-span-2">
                                <table className="w-full text-md bg-white shadow-md rounded mb-4">
                                    <tbody>
                                        <tr className="border-b">
                                            <th className="text-left p-3 px-5">Start Time / เวลาที่เริ่ม</th>
                                            <th className="text-left p-3 px-5">End Time / เวลาที่จบ</th>
                                            <th className="text-left p-3 px-5">Available Slot / จำนวนที่ว่าง</th>
                                        </tr>
                                        {timeslot.map((timeslot) => (
                                            timeslot.amount >= 0 && (
                                                <tr key={timeslot.id} className="border-b hover:bg-orange-100 bg-gray-100">
                                                    <td className="p-3 px-5 bg-gray-50">{timeslot.Start_time}</td>
                                                    <td className="p-3 px-5 bg-gray-50">{timeslot.End_time}</td>
                                                    <td className="p-3 px-5 bg-gray-50">{timeslot.amount}</td>
                                                </tr>
                                            )
                                        ))}
                                    </tbody>
                                </table>
                                <td className="md:col-span-4 text-right inline-flex items-end">
                                    <Link
                                        to={`/admin/timeslothospital/${selectedDate}`}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                        Edit Time Slot / แก้ไขช่วงเวลา
                                    </Link>
                                </td>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeslotHospitalAdmin;
