import React, { useState, useEffect } from 'react';
import NavbarAdmin from './NavbarAdmin';
import { useParams } from 'react-router-dom';

const SendEmailTestReportAdmin = () => {
  const [appointment, setAppointment] = useState({});
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/admin-get-users-appointment-only-received/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
          },
        });
        const data = await response.json();
        console.log(data);
        setAppointment(data.user_info);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id]);

  const sendEmail = async () => {
    // Implement the logic to send the email here
    const emailData = {
      to: appointment[2],  // Assuming appointment[2] contains the email address
      subject: document.getElementById('subject').value,
      text: "Hello",
      // Add other email details as needed
    };

    try {
      const response = await fetch('http://localhost:5000/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const result = await response.json();
      console.log(result);
      // Handle success or error based on the result
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div>
      <NavbarAdmin />
      <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex ">
        <div className="container max-w-screen-md mx-auto">
          <div className="relative">
            <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
              Send Test Result
            </h2>
          </div>
          <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5">
            <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
              <div className="text-gray-600">
                <p className="font-medium text-lg text-black">Send Test Result</p>
              </div>
              <div className="lg:col-span-2">
                <form id="emailForm">
                  <label htmlFor="to" style={{ fontSize: '18px'}}>To: {appointment[2]}</label>
                  <br />
                  <br />
                  <label htmlFor="subject" style={{ fontSize: '18px' }}>Subject:</label>
                  <input type="text" id="subject" name="subject" required />
                  <br />
                  <br />
                  <label htmlFor="attachment" style={{ fontSize: '18px' }}>Attachment:</label>
                  <input type="file" id="attachment" name="attachment" />
                  <br />
                  <br />
                  <button type="button" onClick={sendEmail} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send Email</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmailTestReportAdmin;
