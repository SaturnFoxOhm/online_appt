import React, { useState, useEffect} from 'react';
import NavbarSuperAdmin from './NavbarSuperAdmin';
import { useParams } from 'react-router-dom';

const UpdateTimeslotOffsiteAdmin = () => {
    const [timeslot, setTimeslot] = useState([]);
    const { selectedDate } = useParams();
    const [newAmounts, setNewAmounts] = useState([]); // State to store selected amounts for each timeslot

    // const handleCancel = () => {
    //     window.location.href = `/admin/timeslothospital`;
    // };

    const handleConfirm = () => {
        window.location.href = `/super-admin/timeslotoffsite/`
    }

    const handleSubmitDate = async () => {
        // Fetch timeslots based on the selected date
        try {
            const response = await fetch('http://localhost:5000/super-admin-get-timeslotoffsite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
                },
                body: JSON.stringify({ selectedDate }),
            });
            const data = await response.json();
            setTimeslot(data.time_slot);
            // Initialize newAmounts state with empty values for each timeslot
            const initialAmounts = Array(data.time_slot.length).fill("");
            setNewAmounts(initialAmounts);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSlot = (index, value) => {
        setNewAmounts(prevState => {
            const newState = [...prevState];
            newState[index] = value;
            return newState;
        });
    };

    const handleSlotChange = async (hosSlotID, newAmount) => {
        try {
            const newStatus = {
                hosSlotID: hosSlotID,
                newAmount: newAmount,
                selectedDate: selectedDate
            };
            // Make a POST request to update the timeslot amount
            const response = await fetch('http://localhost:5000/super-admin-update-timeslotoffsite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
                },
                body: JSON.stringify(newStatus),
            });

            if (response.ok) {
                // If the update is successful, refresh the timeslots
                alert('Slot updated successfully');
                window.location.href = `/super-admin/timeslotoffsite/${selectedDate}`;
            } else {
                console.error('Failed to update timeslot off-site:', response.statusText);
                alert('Failed to update timeslot off-site');
            }
        } catch (error) {
            console.error('Error updating timeslot off-site:', error);
            alert('Error updating timeslot off-site');
        }
    };

    useEffect(() => {
        // Fetch data from your backend API
        handleSubmitDate();
    }, [selectedDate]);

    return (
        <div>
            <NavbarSuperAdmin />
            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
                <div className="container max-w-screen-lg mx-auto">
                    <div className="relative">
                        <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                            Time Slots
                        </h2>
                    </div>
                    <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 overflow-x-auto">
                        {/* Add overflow-x-auto to allow horizontal scrolling if needed */}
                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
                            <div className="text-gray-600">
                                <p className="font-medium text-lg text-black">Hospital's Time Slots</p>
                                <p>Selected Date: {selectedDate}</p>
                            </div>
                            <div className="lg:col-span-2">
                                <table className="w-full text-md bg-white shadow-md rounded mb-4">
                                    <tbody>
                                        <tr className="border-b">
                                            <th className="text-left p-3 px-5">Start Time</th>
                                            <th className="text-left p-3 px-5">End Time</th>
                                            <th className="text-left p-3 px-5">Available Slot</th>
                                            <th className="text-left p-3 px-5">Edit Slot</th>
                                        </tr>
                                        {timeslot.map((timeslotItem, index) => (
                                            <tr key={timeslotItem.id} className="border-b hover:bg-orange-100 bg-gray-100">
                                                <td className="p-3 px-5 bg-gray-50">{timeslotItem.Start_time}</td>
                                                <td className="p-3 px-5 bg-gray-50">{timeslotItem.End_time}</td>
                                                <td className="p-3 px-5 bg-gray-50">
                                                    {timeslotItem.amount == -1 ? 'Not Available' : timeslotItem.amount}
                                                </td>

                                                <td className="p-3 px-5 bg-gray-50">
                                                    <select
                                                        value={newAmounts[index]}
                                                        onChange={(e) => handleSlot(index, e.target.value)}
                                                    >
                                                        <option value="" disabled>Select an option</option>
                                                        <option value={5}>5</option>
                                                        <option value={4}>4</option>
                                                        <option value={3}>3</option>
                                                        <option value={2}>2</option>
                                                        <option value={1}>1</option>
                                                        <option value={0}>0</option>
                                                        <option value={-1}>Not Available</option>
                                                    </select>
                                                </td>
                                                <td className="p-3 px-5 bg-gray-50">
                                                    <button
                                                        className="bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded mr-4"
                                                        onClick={() => handleSlotChange(timeslotItem.hosSlotID[0], newAmounts[index])}
                                                    >
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="inline-flex items-end">
                                    <button
                                        onClick={handleConfirm}
                                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-4">Confirm
                                    </button>
                                </div>
                                {/* <div className="inline-flex items-end">
                                    <button
                                        onClick={handleCancel}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Cancel
                                    </button>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateTimeslotOffsiteAdmin;
