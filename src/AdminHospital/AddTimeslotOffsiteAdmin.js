import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
import { useNavigate, Link } from 'react-router-dom';

const AddTimeslotOffsiteAdmin = () => {
    // const [timeslot, setTimeslot] = useState([]);
    const [selectedAmount, setSelectedAmount] = useState([]);
    const [selectedYear, setSelectedYear] = useState([]);
    const [selectedStartTime, setSelectedStartTime] = useState([]);
    const [selectedEndTime, setSelectedEndTime] = useState([]);

    const navigate = useNavigate(); // Hook to navigate programmatically

    const handleConfirm = async () => {

        if ( selectedYear == "") {
            alert("Please select Year / โปรดเลือกปีที่จะเลือก")
        }
        else if ( selectedAmount == "") {
            alert("Please select Amount / โปรดเลือกจำนวนที่ว่าง")
        }
        else if ( selectedStartTime == "") {
            alert("Please select Start Time / โปรดเลือกเวลาที่เริ่ม")
        }
        else if ( selectedEndTime == "") {
            alert("Please select End Time / โปรดเลือกเวลาที่จบ")
        }

        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;

        const data = {
            selectedAmount: selectedAmount,
            startDate: startDate,
            endDate: endDate,
            selectedYear: selectedYear,
            selectedStartTime: selectedStartTime,
            selectedEndTime: selectedEndTime
        };

        try {
            const response = await fetch('http://localhost:5000/admin-add-timeslotoffsite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                alert('New time slot added successfully');
                window.location.reload();
            } else {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <NavbarAdmin />
            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
                <div className="container max-w-screen-lg mx-auto">
                    <div className="relative">
                    </div>

                    <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
                        {/* Add overflow-x-auto to allow horizontal scrolling if needed */}
                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
                            <div className="text-gray-600">
                                <p className="font-medium text-lg text-black">Offsite's Time Slots / ช่วงเวลาทำงานนอกสถานที่</p>
                                <p>Add new Time Slots / เพิ่ม Time Slot ใหม่</p>
                            </div>
                            <div className="lg:col-span-2">
                                <table className="w-full text-md bg-white shadow-md rounded mb-4">
                                    <tbody>
                                        <tr className="border-b">
                                            <th className="text-left p-3 px-5">Year / ปี</th>
                                            <th className="text-left p-3 px-5">Amount / จำนวนที่ว่าง</th>
                                            <th className="text-left p-3 px-5">Start time / เวลาที่เริ่ม</th>
                                            <th className="text-left p-3 px-5">End time / เวลาที่จบ</th>
                                        </tr>
                                        <tr className="border-b hover:bg-orange-100 bg-gray-100">
                                            <td className="p-3 px-5 bg-gray-50">{/* Render the year here */}
                                                <select
                                                    required
                                                    value={selectedYear}
                                                    onChange={(e) => setSelectedYear(e.target.value)}
                                                >
                                                    <option value="">Select an option</option>
                                                    <option value={2025}>2025</option>
                                                    <option value={2026}>2026</option>
                                                    <option value={2027}>2027</option>
                                                    <option value={2028}>2028</option>
                                                    <option value={2029}>2029</option>
                                                    <option value={2030}>2030</option>
                                                    <option value={2031}>2031</option>
                                                </select>
                                            </td>
                                            <td className="p-3 px-5 bg-gray-50">
                                                <select
                                                    required
                                                    value={selectedAmount}
                                                    onChange={(e) => setSelectedAmount(e.target.value)}
                                                >
                                                    <option value="">Select an option</option>
                                                    <option value={5}>5</option>
                                                    <option value={4}>4</option>
                                                    <option value={3}>3</option>
                                                    <option value={2}>2</option>
                                                    <option value={1}>1</option>
                                                    <option value={0}>0</option>
                                                    <option value={-1}>Not Available</option>
                                                </select>
                                            </td>
                                            <td className="p-3 px-5 bg-gray-50">{/* Render the start time here */}
                                                <select
                                                    required
                                                    value={selectedStartTime}
                                                    onChange={(e) => {
                                                        setSelectedStartTime(e.target.value);
                                                        if (selectedEndTime <= e.target.value) {
                                                            setSelectedEndTime(""); // Reset end time if it's less than or equal to start time
                                                        }
                                                    }}
                                                >
                                                    <option value="">Select an option</option>
                                                    <option value={6}>06:00:00</option>
                                                    <option value={7}>07:00:00</option>
                                                    <option value={8}>08:00:00</option>
                                                    <option value={9}>09:00:00</option>
                                                    <option value={10}>10:00:00</option>
                                                    <option value={11}>11:00:00</option>
                                                    <option value={12}>12:00:00</option>
                                                    <option value={13}>13:00:00</option>
                                                    <option value={14}>14:00:00</option>
                                                    <option value={15}>15:00:00</option>
                                                    <option value={16}>16:00:00</option>
                                                    <option value={17}>17:00:00</option>
                                                </select>
                                            </td>
                                            <td className="p-3 px-5 bg-gray-50">{/* Render the end time here */}
                                                <select
                                                    required
                                                    value={selectedEndTime}
                                                    onChange={(e) => setSelectedEndTime(e.target.value)}
                                                    disabled={selectedStartTime === ""} // Disable end time select if start time is not selected
                                                >
                                                    <option value="">Select an option</option>
                                                    <option value={7} disabled={selectedStartTime >= 7}>07:00:00</option>
                                                    <option value={8} disabled={selectedStartTime >= 8}>08:00:00</option>
                                                    <option value={9} disabled={selectedStartTime >= 9}>09:00:00</option>
                                                    <option value={10} disabled={selectedStartTime >= 10}>10:00:00</option>
                                                    <option value={11} disabled={selectedStartTime >= 11}>11:00:00</option>
                                                    <option value={12} disabled={selectedStartTime >= 12}>12:00:00</option>
                                                    <option value={13} disabled={selectedStartTime >= 13}>13:00:00</option>
                                                    <option value={14} disabled={selectedStartTime >= 14}>14:00:00</option>
                                                    <option value={15} disabled={selectedStartTime >= 15}>15:00:00</option>
                                                    <option value={16} disabled={selectedStartTime >= 16}>16:00:00</option>
                                                    <option value={17} disabled={selectedStartTime >= 17}>17:00:00</option>
                                                    <option value={18} disabled={selectedStartTime >= 18}>18:00:00</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div className="inline-flex items-end">
                                    <button
                                        onClick={handleConfirm}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4">Confirm / ยืนยัน
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

export default AddTimeslotOffsiteAdmin;
