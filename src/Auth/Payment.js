import Navbar from './navbar';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import $ from 'jquery';
import moment from 'moment';

const Payment = () => {
    // const [paymentPrice, setPaymentPrice] = useState();
    const [timeLeft, setTimeLeft] = useState(600);
    const [imgqr, setImgqr] = useState(null);
    const [transRef, setTransRef] = useState();
    const [qrGeneratedTime, setQrGeneratedTime] = useState(null);
    const navigate = useNavigate();

    const totalPrice = parseFloat(localStorage.getItem('totalPrice'));

    // Call this func for update datetime of payment "when genarate qrcode"
    const UpdatePaymentDateTime = async () => {
        try {
            const response = await fetch('http://localhost:5000/Insert-Payment', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    totalPrice: localStorage.getItem('totalPrice'),
                    datetime: qrGeneratedTime
                })
            });
            if (response.ok) {
                console.log("Insert payment details successfully");
            } else {
                console.error("Failed to fetch Payment Price data");
            }
        } catch (error) {
            console.error("Error fetching Payment Price data:", error);
        }
    };

    // Call this func after user submit the slip and already have check the slip transaction details
    const handleUploadSlip = async () => {
        try {
            const response = await fetch('http://localhost:5000/check-payment', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({

                })
            });
            if (response.ok) {
                console.log("Confirm Appointment successfully");
            } else {
                console.error("Failed to Confirm Appointment");
                console.error("Status code:", response.status);
                console.error("Status text:", response.statusText);
            }
        } catch (error) {
            console.error("Error Confirm Appointment:", error);
        }
    };

    const [file, setFile] = useState([]);
    const [previewUrl, setPreviewUrl] = useState([]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]; // Get the first file from the list
        if (!selectedFile) {
            return; // No file selected
        }

        // Check if the file type is either PNG or JPEG
        if (selectedFile.type !== 'image/png' && selectedFile.type !== 'image/jpeg') {
            alert('Please select a PNG or JPEG file.');
            return;
        }

        // Optionally, you can store the selected file in state
        setFile(selectedFile);

        // You can also preview the selected image if needed
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const handleSubmitFile = async () => {
        UpdatePaymentDateTime();
        if (!file || file.length === 0) {
            alert('Please select a file.');
            return;
        }
        // const apiKey = '5bd4346e-a4d7-4177-8066-c324e2ed6602';
        try {
            const formData = new FormData();
            formData.append('file', file);
            console.log(formData)
            const response = await axios.post('http://localhost:5000/check-slip', formData, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            // console.log(JSON.stringify(response.data));
            // alert('Successfully upload file.', response.data);
            if (checkResponse(response.data)) {
                console.log('Response data is valid:', response.data);
                handleUploadSlip();
                alert('Successfully upload file. Confirm Appointment successfully.' + response.data);
                navigate('/user/appointment-success');
                //
            } else {
                console.error('Invalid response data:', response.data);
                alert('Invalid response data.' + response.data);
            }
        } catch (error) {
            console.error('Error uploading file:', error.response.data);
            alert('Failed to upload file.c', error.response.data);
        }
    };

    const checkResponse = (response) => {
        const amount = parseFloat(localStorage.getItem('totalPrice'))
        console.log('Amount:', amount);
        const type = response.data.receiver.account.proxy.type
        console.log('Type:', type)
        const acc = response.data.receiver.account.proxy.account
        console.log('Account:', acc)
        const qrDateTime = qrGeneratedTime
        console.log('qrDateTime:', qrDateTime.format('YYYY-MM-DD HH:mm:ss'));
        const responseDateTime = moment(response.data.date);
        console.log('responseDateTime:', responseDateTime.format('YYYY-MM-DD HH:mm:ss'));
        if (
            response &&
            response.data &&
            response.data.receiver &&
            response.data.receiver.account &&
            response.data.receiver.account.proxy &&
            response.data.receiver.account.proxy.type === "MSISDN" &&
            response.data.receiver.account.proxy.account === "xxx-xxx-5668" &&
            response.data.receiver.account.name.th === "นาย ณภัทร ว" &&
            response.data.receiver.account.name.en === "NAPAT V" &&
            response.data.amount &&
            response.data.amount.amount === amount &&
            response.data.amount.local.currency === "764" &&
            responseDateTime.isAfter(qrDateTime)
        ) {
            return true;
        }
        return false;
    }

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.7.1.js';
        script.integrity = 'sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4=';
        script.crossOrigin = 'anonymous';
        script.async = true;
        document.body.appendChild(script);
        genQR();
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // 10 min timer
    useEffect(() => {
        const timer = setTimeout(() => {
            if (timeLeft === 0) {
                // Navigate to another page when timer expires
                navigate('/user/confirmation');
            } else {
                setTimeLeft((prevTime) => prevTime - 1);
            }
        }, 1000); // Update every second
        // Clean up the timer when component unmounts
        return () => clearTimeout(timer);
    }, [timeLeft, navigate]);

    // Format the remaining time as minutes and seconds
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    const saveQRImage = async (qrImageData) => {
        try {
            // Send the base64 data directly in the request body
            const response = await axios.post('http://localhost:5000/saveQR', { qrImageData }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log('QR image saved successfully, Response:', response.data);
            alert('QR image saved successfully.');
        } catch (error) {
            console.error('Error saving QR image:', error);
            alert('Failed to save QR image.');
        }
    };

    const genQR = async () => {
        $.ajax({
            method: 'post',
            url: 'http://localhost:5000/generateQR',
            data: {
                amount: localStorage.getItem('totalPrice'),
            },
            success: function (response) {
                console.log('good', response)
                setImgqr(response.Result);
                setTransRef(response.transRef)
                setQrGeneratedTime(moment());
            }, error: function (err) {
                console.log('bad', err)
            }
        })
    }

    return (
        <div>
            <Navbar />
            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
                <div className="container max-w-screen-md mx-auto">
                    <div className="relative">
                        <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                            <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `90%` }}> 90 %</div>
                        </div>
                        <h2 className="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                            Appoint Health Checkup
                        </h2>
                    </div>

                    <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5 text-center">
                        <p className="font-semibold font-large text-xl text-black whitespace-nowrap">Make A Payment</p>
                        <br />
                        <div>
                            <p>ยอดรวม: {totalPrice} บาท</p>
                        </div>
                        <br />
                        <div>
                            {qrGeneratedTime && (
                                <p>วันที่และเวลา: {moment(qrGeneratedTime).format('YYYY-MM-DD HH:mm:ss')}</p>
                            )}
                        </div>
                        {/* <div>
                    {paymentPrice && paymentPrice.paymentDetails &&(
                            <p>เลขที่รายการ: {transRef}</p>
                        )}
                    </div> */}
                        <img
                            src={imgqr}
                            className="mx-auto my-4"
                            style={{ width: '300px', objectFit: 'contain', display: 'block' }}
                            alt="QR Code"
                        />
                        <div>
                            {totalPrice && (
                                <p className='mb-4'>กรุณาทำรายการภายใน: {formattedTime}</p>
                            )}
                        </div>

                        <button
                            style={{
                                backgroundColor: '#017045',
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                marginBottom: '15px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Optional: Add a subtle box shadow
                            }}
                            onClick={() => {
                                saveQRImage(imgqr);
                            }}
                            onMouseOver={(e) => { e.target.style.backgroundColor = '#54D388'; }}
                            onMouseOut={(e) => { e.target.style.backgroundColor = '#017045'; }}
                        >
                            Save QRCode
                        </button>

                        <div className="flex flex-col items-center justify-center">
                            <p className="font-medium text-lg text-black">Choose Slip:</p>
                            <input
                                type="file"
                                accept="image/png, image/jpeg"
                                onChange={handleFileChange}
                                style={{ marginTop: '8px' }}
                            />
                        </div>
                        {previewUrl && (
                            <div className="mt-2 flex flex-col items-center">
                                <p className="font-medium text-lg text-black">Preview:</p>
                                <img src={previewUrl} alt="Preview" style={{ marginBottom: '10px', marginTop: '8px', maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} />
                            </div>
                        )}

                        <button
                            style={{
                                backgroundColor: '#017045',
                                color: 'white',
                                padding: '12px 24px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Optional: Add a subtle box shadow
                            }}
                            onClick={() => {
                                handleSubmitFile();
                            }}
                            onMouseOver={(e) => { e.target.style.backgroundColor = '#54D388'; }}
                            onMouseOut={(e) => { e.target.style.backgroundColor = '#017045'; }}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;