import React, { useState, useEffect } from 'react';
import Navbar from './navbar'; // Assuming Navbar is the correct filename and default export
import { Link } from 'react-router-dom';

const Appoint = () => {
  const [isBookingForSomeoneElse, setBookingForSomeoneElse] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(true);

  const handleConsentConfirm = () => {
    setShowConsentModal(false); // Close the modal when consent is confirmed
  };

  useEffect(() => {
    // Fetch user data from the server when the component mounts
    // const decoded = jwt.verify(token, 'mysecret');
    // lineuserId = decoded.sub;
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/user-profile', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('data', data)
          setIDNumber(data.InfoID);
          setFirstName(data.first_name);
          setLastName(data.last_name);
          setEmail(data.email);
          setPhoneNumber(data.phone);
          setBirthDate(data.birthday);
          if (data.sex === 'M') {
            setGender("Male");
          }
          else if (data.sex === 'F') {
            setGender("Female");
          }
          setWeight(data.weight);
          setHeight(data.height);
          setAllergic(data.allergic);
          setCongenitalDisease(data.congenital_disease);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Call the fetchUserData function
    fetchUserData();
  }, [])

  // Set default value
  const [id_number, setIDNumber] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [birthdate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [allergic, setAllergic] = useState("");
  const [congenital_disease, setCongenitalDisease] = useState("");

  const BD = birthdate.split("-");
  let BD_month = "";
  if (BD[1] === "01") {
    BD_month = "Jan"
  }
  else if (BD[1] === "02") {
    BD_month = "Feb"
  }
  else if (BD[1] === "03") {
    BD_month = "Mar"
  }
  else if (BD[1] === "04") {
    BD_month = "Apr"
  }
  else if (BD[1] === "05") {
    BD_month = "May"
  }
  else if (BD[1] === "06") {
    BD_month = "Jun"
  }
  else if (BD[1] === "07") {
    BD_month = "Jul"
  }
  else if (BD[1] === "08") {
    BD_month = "Aug"
  }
  else if (BD[1] === "09") {
    BD_month = "Sep"
  }
  else if (BD[1] === "10") {
    BD_month = "Oct"
  }
  else if (BD[1] === "11") {
    BD_month = "Nov"
  }
  else if (BD[1] === "12") {
    BD_month = "Dec"
  }

  const currentUserInfo = {
    id: id_number,
    name: first_name + ' ' + last_name,
    email: email,
    phone: phone_number,
    birthdate: BD[2] + " " + BD_month + " " + BD[0],
    sex: gender,
    weight: weight,
    height: height,
    allergic: allergic,
    disease: congenital_disease
  };

  const storeIDnumber = () => {
    if (currentUserInfo.id) {
      localStorage.setItem('InfoID', currentUserInfo.id);
      console.log('Info ID stored in local storage:', currentUserInfo.id);

      // Test localStorage
      const testInfoID = localStorage.getItem('InfoID');
      console.log('Info ID from local storage:', testInfoID);
    }
    else {
      console.error('Info ID is empty or undefined');
    }
  };

  const handleCheckboxChange = () => {
    setBookingForSomeoneElse((prev) => !prev);
  };

  const formatIDNumber = (id) => {
    // Check if the ID number has the correct length
    if (id.length !== 13) {
        return 'Invalid ID number';
    }

    // Split the ID number into segments
    const segments = [
        id.slice(0, 1),
        id.slice(1, 5),
        id.slice(5, 10),
        id.slice(10, 12),
        id.slice(12)
    ];

    // Join the segments with dashes
    return segments.join('-');
  };

  return (
    <div>
      <Navbar />

      {/* Modal for PDPA consent */}
      {showConsentModal && (
        <div className="fixed top-10 left-10 bottom-10 right-10 flex items-center justify-center bg-gray-800 bg-opacity-50" style={{ zIndex: 2 }}>
          <div className="bg-white p-8 rounded-lg" style={{ zIndex: 2 }}>
            <h2 className="text-xl font-bold mb-4">ขอความยินยอมการเก็บข้อมูลส่วนบุคคล</h2>
            <p>เราให้ความสำคัญกับความเป็นส่วนตัวและความคุ้มครองข้อมูลส่วนบุคคลของท่าน ดังนั้นเราขอความยินยอมในการเก็บ ใช้ และเปิดเผยข้อมูลส่วนบุคคลของท่านตามนโยบายด้านล่างนี้:</p>
            <br/>
            <h3 className="font-semibold">การเก็บข้อมูล</h3>
            <p>เราจะเก็บข้อมูลส่วนบุคคลของท่านเฉพาะเมื่อมีความจำเป็นและเกี่ยวข้องกับการให้บริการหรือการดำเนินงานของเรา โดยเราจะเก็บข้อมูลโดยชอบธรรมและตรงไปตามวัตถุประสงค์ที่ชัดเจนที่ได้รับความยินยอมจากท่านล่วงหน้า</p>
            <br/>
            <h3 className="font-semibold">วัตถุประสงค์ของการเก็บข้อมูล</h3>
            <p>ข้อมูลที่เราเก็บจะใช้เพื่อวัตถุประสงค์ที่ชัดเจนและเฉพาะเจาะจง ซึ่งอาจรวมถึงการให้บริการที่เป็นประโยชน์แก่ท่าน การดำเนินการตามคำขอหรือสั่งซื้อ การให้ข้อมูลที่เกี่ยวข้องกับสินค้าหรือบริการ และเพื่อการตลาดหรือการโฆษณาเมื่อได้รับความยินยอมจากท่าน</p>
            <br/>
            <h3 className="font-semibold">การเปิดเผยข้อมูล</h3>
            <p>เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของท่านแก่บุคคลภายนอกที่ไม่มีความจำเป็นโดยชอบธรรม และจะใช้ข้อมูลท่านเฉพาะในการดำเนินการตามวัตถุประสงค์ที่ได้ระบุไว้เท่านั้น</p>
            <br/>
            <h3 className="font-semibold">การรักษาข้อมูล</h3>
            <p>ข้อมูลส่วนบุคคลของท่านจะถูกเก็บรักษาไว้ในระยะเวลาที่จำเป็นเพียงพอต่อการดำเนินงานของเรา และจะถูกทำลายหรือลบออกจากระบบเมื่อไม่มีความจำเป็นต่อการเก็บรักษาอีกต่อไป</p>
            <br/>
            <h3 className="font-semibold">สิทธิของท่าน</h3>
            <p>ท่านมีสิทธิที่จะขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของท่านที่เราเก็บรวบรวมไว้ และสามารถเลือกที่จะยกเลิกความยินยอมในการใช้ข้อมูลได้ตามต้องการ</p>
            <br/>
            <h3 className="font-semibold">การติดต่อ</h3>
            <p>หากท่านมีข้อสงสัยหรือข้อสอบถามเกี่ยวกับการเก็บรักษาข้อมูลส่วนบุคคล หรือต้องการใช้สิทธิของท่านตามกฎหมาย PDPA กรุณาติดต่อเราที่ มหาวิทยาลัยนเรศวร 99 หมู่ 9 ต.ท่าโพธิ์ อ.เมืองพิษณุโลก จ.พิษณุโลก 65000 โทรศัพท์:0 5596 1000 Fax:0 5596 1103 Email: naresuan@nu.ac.th.</p>
            <br/>
            <h3 className="font-semibold">การยินยอม</h3>
            <p>การใช้บริการหรือการเข้าชมเว็บไซต์ของเราถือเป็นการยินยอมและตกลงกับนโยบายการคุ้มครองข้อมูลส่วนบุคคลนี้</p>
            <br/>
            <button 
              onClick={handleConsentConfirm} 
              className="text-white font-bold py-2 px-4 rounded mt-4"
              style={{ backgroundColor: '#017045', ':hover': { backgroundColor: '#54D388 ' }, float: 'right' }}
            >
                ยอมรับ
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
        <div className="container max-w-screen-md mx-auto">
          <div className="relative" style={{ zIndex: 1 }}>
            <div className="progress-bar-container h-8 bg-gray-300 mt-2 mb-8 rounded-full border-2 border-gray-800 overflow-hidden" style={{ zIndex: 1 }}>
              <div className="progress-bar font-bold bg-yellow-500 h-full border-r-2 border-gray-800 flex items-center justify-center" style={{ width: `10%`, zIndex: 1 }}> 10 %</div>
            </div>
          </div>

          <div className="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5">
            <div className="grid gap-4 gap-y-2 text-m grid-cols-1 lg:grid-cols-2">
              <div className="text-gray-600">
                <p className="font-large font-bold text-xl text-black">User Information</p>
              </div>

              <div className="lg:col-span-2 flex flex-col">
                <div>
                  <p>ID Number / เลขบัตรประชาชน: {formatIDNumber(currentUserInfo.id)}</p>
                  <p>Name / ชื่อ นามสกุล: {currentUserInfo.name}</p>
                  <p>Email / อีเมล: {currentUserInfo.email}</p>
                  <p>Phone / เบอร์โทรศัพท์: {currentUserInfo.phone}</p>
                  <p>Birthday / วันเดือนปี เกิด: {currentUserInfo.birthdate}</p>
                  <p>Sex / เพศ: {currentUserInfo.sex}</p>
                  <p>Weight / น้ำหนัก: {currentUserInfo.weight}</p>
                  <p>Height / ส่วนสูง: {currentUserInfo.height}</p>
                  <p>Allergic / โรคภูมิแพ้: {currentUserInfo.allergic || '-'}</p>
                  <p>Congenital Disease / โรคประจำตัว: {currentUserInfo.disease || '-'}</p>

                  <label className="block mt-4">
                     <input
                        type="checkbox"
                        checked={isBookingForSomeoneElse}
                        onChange={handleCheckboxChange}
                        className="mr-2 h-4 w-4" // Adjust the height and width as needed
                    />
                     Make this booking for someone else / ทำการจองนี้ให้คนอื่น
                  </label>
                </div>
                
                {isBookingForSomeoneElse === false ? (
                <div style={{ display: 'grid', placeItems: 'end' }}>
                  <Link to={"/user/Place"}>
                    <button 
                      onClick={storeIDnumber}
                      className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Next / ต่อไป
                    </button>
                  </Link>
                </div>
                ) : (
                  <BookingForSomeoneElseForm />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appoint;

const BookingForSomeoneElseForm = () => {
  const [newIDNumber, setNewIDNumber] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBirthdate, setNewBirthdate] = useState('');
  const [newSex, setNewSex] = useState('M');
  const [newPhone, setNewPhone] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newDisease, setNewDisease] = useState('');

  const addNewUserProfile = async (e) => {
    e.preventDefault(); // Prevents the form from submitting and triggering a page reload

    try {
      const response = await fetch('http://localhost:5000/add-user-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newIDNumber,
          email: newEmail,
          fname: newFirstName,
          lname: newLastName,
          BD: newBirthdate,
          sex: newSex,
          phone: newPhone,
          weight: newWeight,
          height: newHeight,
          allergy: newAllergy,
          disease: newDisease,
        }),
      });
      console.log(response);

      if (newIDNumber) {
        localStorage.setItem('InfoID', newIDNumber);
        console.log('Info ID stored in local storage:', newIDNumber);

        // Test Storing in localStorage
        const testInfoID = localStorage.getItem('InfoID');
        console.log('Info ID from local storage:', testInfoID);
      }else{
        console.error('Info ID is empty or undefined');
      }

      if (response.ok) {
        // Handle success
        console.log('User data added successfully');
        // Redirect to the next page after successful submission
        window.location.href = "/user/Place";
      } else {
        // Handle error
        console.error('Failed to add user data');
      }
    } catch (error) {
      console.error('Error adding user data:', error);
    }
  };

  return (
    <div className='flex flex-col'>
    <br />
      <form onSubmit={addNewUserProfile}>
        <label>
          * ID Number / เลขบัตรประชาชน:
          <input type="text" required pattern="\d{13}" title="Please enter a valid 13-digit ID Number" value={newIDNumber} onChange={(e) => setNewIDNumber(e.target.value)} />
        </label>
        <br />
        <label>
          * First Name / ชื่อ:
          <input type="text" required value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
        </label>
        <br />
        <label>
          * Last Name / นามสกุล:
          <input type="text" required value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
        </label>
        <br />
        <label>
          * Email / อีเมล:
          <input type="email" required pattern="\S+@\S+\.\S+" title="Please enter a valid email address" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
        </label>
        <br />
        <label>
          * Birthdate / วันเดือนปี เกิด:
          <input type="date" required value={newBirthdate} onChange={(e) => setNewBirthdate(e.target.value)} />
        </label>
        <br />
        <label className="flex items-center">
          * Sex / เพศ:
          <select
            required 
            defaultValue='M'
            value={newSex}
            onChange={(e) => setNewSex(e.target.value)}
            className="ml-2 border rounded px-3 py-1 mt-2"
          >
            <option value='M'>Male</option>
            <option value='F'>Female</option>
          </select>
        </label>
        <br />
        <label>
          * Phone / เบอร์โทรศัพท์:
          <input type="text" required pattern="\d{10}" title="Please enter a valid 10-digit Phone Number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
        </label>
        <br />
        <label>
          * Weight / น้ำหนัก:
          <input type='text' required value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
        </label>
        <label>
          * Height / ส่วนสูง: 
          <input type='text'required value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
        </label>               
        <br />
        <label>
          Allergy / โรคภูมิแพ้:
          <input type='text' value={newAllergy} onChange={(e) => setNewAllergy(e.target.value)} />
        </label>
        <br/>
        <label>
          Cognition Disease / โรคประจำตัว: 
          <input type='text' value={newDisease} onChange={(e) => setNewDisease(e.target.value)} />
        </label> 
        <div style={{ display: 'grid', placeItems: 'end' }}>
          <button
            type="submit"
            className="self-end bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
};
