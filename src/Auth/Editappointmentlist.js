import React, { useState } from 'react';

const Editappointmentlist = () => {

    const [id_number, setIDNumber] = useState("1234567891544");
    const [isDetailsVisible, setIsDetailsVisible] = useState(true);
  
    const handleButtonClick = () => {
      setIsDetailsVisible(!isDetailsVisible);
    };

  return (
    <div className="text-center text-lg text-gray-700">
        Something else to show when details are hidden.
        <div>
        <button
            className="flex items-center justify-end"
            onClick={handleButtonClick}
        >
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13"/>
            </svg>
        </button>
        </div>
    </div>
  )
}

export default Editappointmentlist