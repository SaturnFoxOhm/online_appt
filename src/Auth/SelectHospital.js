// const apiKey = "AIzaSyCXeuTdudUzUXs_GazOer0Ya69gsij4Sag";
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Hospital = () => {
    const [hospitalList, setHospitalList] = useState([]);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [method, setMethod] = useState("current");
    const [addressLine1, setAddressLine1] = useState(null);
    const [addressLine2, setAddressLine2] = useState(null);
    const [province, setProvince] = useState(null);
    const [city, setCity] = useState(null);
    const [postalCode, setPostalCode] = useState(null);
    let lat, long; 

    const navigate = useNavigate();

    const findMyState =async () => {
        const status = document.querySelector('.status');

        const success = async (position) => {
            if (method === "current") {
              lat = position.coords.latitude;
              long = position.coords.longitude;
            }
            else if (method === "address") {
              if (addressLine1 || city || province || postalCode) {
                const address = `${addressLine1}, ${addressLine2}, ${city}, ${province}, ${postalCode}`;
                const geocodeResponse = await axios.get('http://localhost:5000/geocode', {
                    params: {
                        address: address,
                    },
                });

                if (geocodeResponse.data.lat && geocodeResponse.data.lng) {
                  lat = geocodeResponse.data.lat;
                  long = geocodeResponse.data.lng;
                }
              }
              else {
                return;
              }
            }
        
            if (hospitalList.length > 0) {
              const updatedHospitalList = await Promise.all(hospitalList.map(async (hospital) => {
                const desLat = hospital.latitude;
                const desLong = hospital.longitude;
        
                try {
                  const response = await axios.get('http://localhost:5000/get-distance', {
                    params: {
                      origins: `${lat},${long}`,
                      destinations: `${desLat},${desLong}`,
                      units: 'metric',
                    },
                  });
        
                  if (response.data.distance) {
                    const distanceText = response.data.distance;
        
                    return {
                      ...hospital,
                      distance: distanceText
                    };
                  } else {
                    console.error('Error fetching distance');
                    return hospital;
                  }
        
                } catch (error) {
                  console.error('Error fetching distance:', error);
                  return hospital;
                }
              }));
        
              const sortedHospitalList = updatedHospitalList.sort((a, b) => {
                if (a.distance < b.distance) return -1;
                if (a.distance > b.distance) return 1;
                return 0;
              });
        
              setHospitalList(sortedHospitalList);
            } else {
              console.error('HospitalList is null or undefined');
            }
          }

        const error = () => {
            status.textContent = 'Unable to retrieve your location';
        }
        navigator.geolocation.getCurrentPosition(success, error);
    };

    useEffect(() => {
        const findMyState = async () => {
          const status = document.querySelector('.status');
      
          const success = async (position) => {
            if (method === "current") {
              lat = position.coords.latitude;
              long = position.coords.longitude;
            }
            else if (method === "address") {
              if (addressLine1 || city || province || postalCode) {
                const address = `${addressLine1}, ${addressLine2}, ${city}, ${province}, ${postalCode}`;
                const geocodeResponse = await axios.get('http://localhost:5000/geocode', {
                    params: {
                        address: address,
                    },
                });

                if (geocodeResponse.data.lat && geocodeResponse.data.lng) {
                  lat = geocodeResponse.data.lat;
                  long = geocodeResponse.data.lng;
                }
              }
              else {
                return;
              }
            }
      
            const fetchHospitalData = async () => {
              try {
                const response = await fetch('http://localhost:5000/hospital-list', {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                  },
                });
      
                if (response.ok) {
                  const data = await response.json();
      
                  // Calculate distances for each hospital by calling the server
                  const distances = await Promise.all(
                    data.map(async (hospital) => {
                      try {
                        const distanceResponse = await axios.get('http://localhost:5000/get-distance', {
                          params: {
                            origins: `${lat},${long}`,
                            destinations: `${hospital.latitude},${hospital.longitude}`,
                            units: 'metric',
                          },
                        });
      
                        if (distanceResponse.data.distance) {
                          const distanceText = distanceResponse.data.distance;
                          return { ...hospital, distance: distanceText };
                        } else {
                          console.error('Error fetching distance');
                          return { ...hospital, distance: null };
                        }
                      } catch (error) {
                        console.error('Error fetching distance:', error);
                        return { ...hospital, distance: null };
                      }
                    })
                  );
      
                  // Sort hospitals by distance
                  const sortedHospitalList = distances.sort((a, b) => {
                    const distanceA = parseFloat(a.distance.replace(' km', ''));
                    const distanceB = parseFloat(b.distance.replace(' km', ''));
                    return distanceA - distanceB;
                  });
      
                  setHospitalList(sortedHospitalList);
                } else {
                  console.error('Failed to fetch hospital data');
                }
              } catch (error) {
                console.error('Error fetching hospital data:', error);
              }
            };
      
            fetchHospitalData();
          };
      
          const error = () => {
            status.textContent = 'Unable to retrieve your location';
          };
          navigator.geolocation.getCurrentPosition(success, error);
        };
      
        findMyState();
      }, [method, addressLine1, addressLine2, city, province, postalCode]);

    useEffect(() => {
        if (selectedHospital) {
            findMyState();
        }
    }, [selectedHospital]);

    const handleHospitalChange = (hospitalId) => {
        setSelectedHospital(hospitalId);
    };

    const handleSelectMethod = (place) => {
      setMethod(place);
      console.log("place in func: ", place);
      console.log("method: ", method);
    };

    const storeHospital = () => {
        if (selectedHospital) {
            localStorage.setItem('selectedHospital', selectedHospital);
            console.log('Selected hospital stored in local storage:', selectedHospital);
            navigate('/user/datetime');
        } else {
            console.error('No hospital selected');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
                <div className="container max-w-screen-md mx-auto">
                    <div className="relative">
                        <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden">
                            <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `30%` }}> 30 %</div>
                        </div>
                    </div>
                    <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5">
                        <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-1">
                            <div className="text-gray-600">
                                <p className="font-large text-xl text-black whitespace-nowrap">Select Hospital / กรุณาเลือกโรงพยาบาล</p>
                                <br />
                                <input
                                    type="radio"
                                    name="choice"
                                    value={"current"}
                                    onChange={() => handleSelectMethod("current")}
                                    checked={method === "current"}
                                /> ตำแหน่งปัจจุบัน
                                <input
                                    type="radio"
                                    name="choice"
                                    value={"address"}
                                    onChange={() => handleSelectMethod("address")}
                                    checked={method === "address"}
                                    style={{ marginLeft: '20px' }}
                                /> ที่อยู่ที่ต้องการเทียบระยะทางกับโรงพยาบาล
                                <br/>
                                <br/>
                                {method === 'address' && (
                                  <div>
                                    <label>
                                    Address line 1 / ที่อยู่ 1 *
                                    <input type="text" required value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
                                    </label>
                                    <br />
                                    <label>
                                    Address line 2 / ที่อยู่ 2 (optional)
                                    <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} />
                                    </label>
                                    <br />
                                    <label>
                                    Province / จังหวัด *
                                    <input type="text" required value={province} onChange={(e) => setProvince(e.target.value)} />
                                    </label>
                                    <br />
                                    <label>
                                    City / เมือง *
                                    <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} />
                                    </label>
                                    <br />
                                    <label>
                                    Postal code / รหัสไปรษณีย์ *
                                    <input type="text" required value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                                    </label>
                                    <br />
                                    <br />
                                  </div>
                                )}

                                {/* Render the list of hospitals */}
                                {hospitalList.map(hospital => (
                                    <li key={hospital.HospitalID} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="radio"
                                            name="hospital"
                                            value={hospital.HospitalID}
                                            checked={selectedHospital === hospital.HospitalID}
                                            onChange={() => handleHospitalChange(hospital.HospitalID)}
                                            style={{ marginRight: '10px' }}
                                        />
                                        <div style={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '10px', padding: '10px', width: '100%', marginLeft: '10px' }}>
                                            <span><strong>{hospital.hos_name}</strong></span> <br />
                                            <span>Telephone / เบอร์โทรศัพท์: {hospital.hos_tel}</span><br />
                                            {/* <span>Region: {hospital.hos_region}</span><br />
                                            <span>Location: {hospital.hos_location}</span><br /> */}
                                            <span>Type / ประเภท: {hospital.hos_type}</span><br />
                                            {/* <span>Laitude: {hospital.latitude}</span><br />
                                            <span>longtiude: {hospital.longitude}</span><br /> */}
                                            <span>Distance / ระยะทาง: {hospital.distance || '-'}</span>
                                        </div>
                                    </li>
                                ))}
                            </div>
                            <div style={{ display: 'grid', placeItems: 'end' }}>
                                <button
                                    onClick={storeHospital}
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

export default Hospital;
