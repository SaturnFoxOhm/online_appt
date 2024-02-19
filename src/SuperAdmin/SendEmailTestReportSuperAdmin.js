import React, { useState, useEffect } from 'react';
import NavbarSuperAdmin from './NavbarSuperAdmin';
import { useParams } from 'react-router-dom';

const SendEmailTestReportSuperAdmin = () => {
  const [appointment, setAppointment] = useState({});
  const [subject, setSubject] = useState(''); // Set your default subject here
  const [text, setText] = useState(''); // Set your default message here
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/super-admin-get-users-appointment-only-waiting/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('tokenSuperAdmin')}`,
          },
        });
        const data = await response.json();
        console.log(data);
        setAppointment(data.user_info);
        // Check if appointment[1] is truthy before setting the subject
        if (data.user_info && data.user_info[1]) {
          setSubject(`ผลการตรวจของคุณ ${data.user_info[1]} จากเว็บ FastAppt`);
          setText(`เรียน ${data.user_info[1]}\n\nทางเราได้ทำการส่งผลตรวจตามรายการตรวจที่คุณนั้นได้ทำการนัดหมายเมื่อวันที่ ${data.user_info[3]} กับทาง โรงพยาบาล ${data.user_info[10]}\n\nจึงเรียนมาเพื่อทราบ`);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id]);

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  const sendEmail = async (event) => {
    event.preventDefault();
    // Implement the logic to send the email here
    const emailData = new FormData();
    emailData.append('appt_id', id);
    emailData.append('to', appointment[2]);  // Assuming appointment[2] contains the email address
    emailData.append('subject', document.getElementById('subject').value);
    emailData.append('text', document.getElementById('text').value);
    const attachmentInput = document.getElementById('attachment');
    if (attachmentInput.files.length > 0) {
      const attachmentFile = attachmentInput.files[0];
      const attachmentBase64 = await getBase64(attachmentFile); 
      emailData.append('attachment', attachmentBase64);
    }

    try {
      const response = await fetch('http://localhost:5000/admin-sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tokenAdmin')}`,
        },
        body: JSON.stringify(Object.fromEntries(emailData.entries())),
      });

      const result = await response.json();
      alert("Send Email to User Successful!")
      if(response.status === 200){  
        window.location.href = `/admin/sendTestReport`;
      }
      // Handle success or error based on the result
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div>
      <NavbarSuperAdmin />
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
                <form id="emailForm" onSubmit={sendEmail}>
                  <label htmlFor="to" style={{ fontSize: '18px'}}>To: {appointment[2]}</label>
                  <br />
                  <br />
                  <label htmlFor="subject" style={{ fontSize: '18px' }}>Subject:</label>
                  <input type="text" id="subject" name="subject" value={subject} required onChange={(e) => setSubject(e.target.value)} />
                  <br />
                  <br />
                  <label htmlFor="text" style={{ fontSize: '18px' }}>Message:</label>
                  <textarea type="text" id="text" name="text" value={text} required onChange={(e) => setText(e.target.value)} class="w-full h-48 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"/>
                  <br />
                  <br />
                  <label htmlFor="attachment" style={{ fontSize: '18px' }}>Attachment (PDF):</label>
                  <input type="file" id="attachment" name="attachment" required/>
                  <br />
                  <br />
                  <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Send Email</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendEmailTestReportSuperAdmin;