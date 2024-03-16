import React, { useState, useEffect } from "react";
import Navbar from "./navbar";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Fetch user data from the server when the component mounts
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
          if (data.sex == "M") {
            setGender("M");
          }
          else if (data.sex == "F") {
            setGender("F");
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
  const [id_number, setIDNumber] = useState("1234567891544");
  const [first_name, setFirstName] = useState("John");
  const [last_name, setLastName] = useState("Cena");
  const [email, setEmail] = useState("John@gmail.com");
  const [phone_number, setPhoneNumber] = useState("0861140541");
  const [birthdate, setBirthDate] = useState("2002-01-04");
  const [gender, setGender] = useState("M");
  const [weight, setWeight] = useState("70.0");
  const [height, setHeight] = useState("180.0");
  const [allergic, setAllergic] = useState("Alcohol");
  const [congenital_disease, setCongenitalDisease] = useState("Diabetes");

  const ChangeEditStatus = () => {
    setIsEditing(!isEditing);
  };

  const formatDateForInput = (dateString) => {
    return dateString; // Assuming dateString is in the "YYYY-MM-DD" format
  };

  // Regex pattern for a simple email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Regex pattern for a simple ID Number validation
  const id_numberRegex = /^\d{13}$/;

  // Regex pattern for a simple Name validation
  const NameRegex = /^\S[A-z]+$/;

  // Regex pattern for a simple Phone validation
  const PhoneRegex = /^(0\d{9})$/;

  // Regex pattern for a simple Birthdate validation
  const BirthDateRegex =
    /^(?:19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

  // Regex pattern for a simple Gender validation
  const GenderRegex = /^(M|F)$/;

  // Function to check if the email is valid
  const isEmailValid = (value) => emailRegex.test(value);

  // Function to check if the ID Number is valid
  const isIdNumberValid = (value) => id_numberRegex.test(value);

  // Function to check if the First Name is valid
  const isFirstNameValid = (value) => NameRegex.test(value);

  // Function to check if the First Name is valid
  const isLastNameValid = (value) => NameRegex.test(value);

  // Function to check if the Phone Number is valid
  const isPhoneValid = (value) => PhoneRegex.test(value);

  const isBirthdateValid = (value) => BirthDateRegex.test(value);

  const isGenderValid = (value) => GenderRegex.test(value);

  // Function to handle form submission
  const handleFormSubmit = async (e) => {
    // Perform validation checks
    const isEmailValid = emailRegex.test(email);
    const isIdNumberValid = id_numberRegex.test(id_number);
    const isFirstNameValid = NameRegex.test(first_name);
    const isLastNameValid = NameRegex.test(last_name);
    const isPhoneValid = PhoneRegex.test(phone_number);
    const isBirthdateValid = BirthDateRegex.test(birthdate);
    const isGenderValid = GenderRegex.test(gender);

    // If any validation fails, return without submitting the form
    if (
      !isEmailValid ||
      !isIdNumberValid ||
      !isFirstNameValid ||
      !isLastNameValid ||
      !isPhoneValid ||
      !isBirthdateValid ||
      !isGenderValid
    ) {
      // Optionally, you can display error messages or handle invalid input feedback
      alert("Please Insert All Section Correctly.");
      return false;
    }
    
    console.log('Fname', first_name);
    console.log('Lname', last_name);

    try {
      const response = await fetch('http://localhost:5000/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id_number,
          first_name,
          last_name,
          email,
          phone_number,
          birthdate,
          gender,
          weight,
          height,
          allergic,
          congenital_disease,
        }),
      });
  
      if (response.ok) {
        alert('Edit Successful!');
        setIsEditing(false);
      } else {
        console.error('Failed to update user profile');
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div class="min-h-screen p-6 bg-gradient-to-r from-green-500 to-emerald-300 flex">
        <div class="container max-w-screen-lg mx-auto">
          <div>
            <div class="relative">
              <h2 class="font-bold text-lg text-white mb-6 inline-block mr-6 bg-blue-500 py-2 px-4 rounded-l-md rounded-r-md">
                Profile Page
              </h2>
              <a
                href="/user/appointmentlist"
                class="font-bold text-lg text-white mb-6 inline-block mr-6 bg-gray-500 py-2 px-4 rounded-l-md rounded-r-md"
              >
                Appointment Page
              </a>
            </div>
            <div class="bg-gray-300 rounded shadow-lg p-4 px-4 md:p-6 mb-5">
              <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-2">
                <div class="text-gray-600">
                  <p class="font-medium text-lg text-black">User Information</p>
                </div>

                <div class="lg:col-span-2">
                  <div class="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-4">
                    <div class="md:col-span-4">
                      <label for="id_number">ID Number</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="id_number"
                            id="id_number"
                            class={`h-10 border mt-1 rounded px-2 w-full ${
                              isIdNumberValid(id_number)
                                ? "bg-gray-50"
                                : "bg-red-200"
                            }`}
                            value={id_number}
                            onChange={(e) => {
                              setIDNumber(e.target.value);
                            }}
                          />
                          {!isIdNumberValid(id_number) && (
                            <p class="text-red-500 text-xs mt-1">
                              Please enter a valid ID number (13 digit numbers).
                            </p>
                          )}
                        </div>
                      ) : (
                        <div
                          class={`h-10 border mt-1 rounded px-2 w-full ${
                            isIdNumberValid(id_number)
                              ? "bg-gray-50"
                              : "bg-red-200"
                          } flex items-center justify-left`}
                        >
                          {id_number[0] +
                            "-" +
                            id_number.substring(1, 5) +
                            "-" +
                            id_number.substring(5, 10) +
                            "-" +
                            id_number.substring(10, 12) +
                            "-" +
                            id_number[12]}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-2">
                      <label for="first_name">First Name</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="first_name"
                            id="first_name"
                            class={`h-10 border mt-1 rounded px-2 w-full ${
                              isFirstNameValid(first_name)
                                ? "bg-gray-50"
                                : "bg-red-200"
                            }`}
                            value={first_name}
                            onChange={(e) => {
                              setFirstName(e.target.value);
                            }}
                          />
                          {!isFirstNameValid(first_name) && (
                            <p class="text-red-500 text-xs mt-1">
                              Please enter a valid First Name (More than 1
                              letter).
                            </p>
                          )}
                        </div>
                      ) : (
                        <div class="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {first_name}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-2">
                      <label for="last_name">Last Name</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="last_name"
                            id="last_name"
                            class={`h-10 border mt-1 rounded px-2 w-full ${
                              isLastNameValid(last_name)
                                ? "bg-gray-50"
                                : "bg-red-200"
                            }`}
                            value={last_name}
                            onChange={(e) => {
                              setLastName(e.target.value);
                            }}
                          />
                          {!isLastNameValid(last_name) && (
                            <p class="text-red-500 text-xs mt-1">
                              Please enter a valid Last Name (More than 1
                              letter).
                            </p>
                          )}
                        </div>
                      ) : (
                        <div class="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {last_name}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-2">
                      <label for="email">Email Address</label>
                      {isEditing ? (
                        <div>
                          <input
                            type="text"
                            name="email"
                            id="email"
                            class={`h-10 border mt-1 rounded px-2 w-full ${
                              isEmailValid(email) ? "bg-gray-50" : "bg-red-200"
                            }`}
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                            }}
                          />
                          {!isEmailValid(email) && (
                            <p class="text-red-500 text-xs mt-1">
                              Please enter a valid email address.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div class="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {email}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-1">
                      <label for="phone_number">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone_number"
                          id="phone_number"
                          class={`h-10 border mt-1 rounded px-2 w-full ${
                            isPhoneValid(phone_number)
                              ? "bg-gray-50"
                              : "bg-red-200"
                          }`}
                          value={phone_number}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                          }}
                        />
                      ) : (
                        <div
                          class={`h-10 border mt-1 rounded px-2 w-full ${
                            isPhoneValid(phone_number)
                              ? "bg-gray-50"
                              : "bg-red-200"
                          } flex items-center justify-left`}
                        >
                          {phone_number.substring(0, 3) +
                            "-" +
                            phone_number.substring(3, 6) +
                            "-" +
                            phone_number.substring(6, 10)}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-1">
                      <label for="birthdate">Birth Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="birthdate"
                          id="birthdate"
                          class={`h-10 border mt-1 rounded px-2 w-full bg-gray-50 ${
                            isBirthdateValid(birthdate)
                              ? "bg-gray-50"
                              : "bg-red-200"
                          }`}
                          value={formatDateForInput(birthdate)}
                          onChange={(e) => {
                            setBirthDate(e.target.value);
                            console.log(e.target.value);
                          }}
                        />
                      ) : (
                        <div
                          class={`h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left`}
                        >
                          {birthdate}
                        </div>
                      )}
                      {isEditing && birthdate === "" && (
                        <p className="text-red-500 text-xs mt-1">
                          Please select a birthdate.
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="gender">Gender</label>
                      {isEditing ? (
                        <div
                          className={`h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1 ${
                            isGenderValid(gender) ? "bg-gray-50" : "bg-red-200"
                          }`}
                        >
                          <select
                            name="gender"
                            id="gender"
                            className={`px-2 outline-none text-gray-800 w-full ${
                              isGenderValid(gender)
                                ? "bg-gray-50"
                                : "bg-red-200"
                            }`}
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                          >
                            <option className="bg-gray-50" value="">
                              Select Gender
                            </option>
                            <option className="bg-gray-50" value="M">
                              Male
                            </option>
                            <option className="bg-gray-50" value="F">
                              Female
                            </option>
                          </select>
                        </div>
                      ) : (
                        <div className="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {gender === 'M' ? 'Male' : (gender === 'F' ? 'Female' : '')}
                        </div>
                      )}
                      {isEditing && !isGenderValid(gender) && (
                        <p className="text-red-500 text-xs mt-1">
                          Please select a gender.
                        </p>
                      )}
                    </div>

                    <div class="md:col-span-1">
                      <label for="weight">Weight</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="weight"
                          id="weight"
                          class="h-10 border mt-1 rounded px-2 w-full bg-gray-50"
                          value={weight}
                          onChange={(e) => {
                            setWeight(e.target.value);
                          }}
                        />
                      ) : (
                        <div class="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {weight}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-1">
                      <label for="height">Height</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="height"
                          id="height"
                          class="h-10 border mt-1 rounded px-2 w-full bg-gray-50"
                          value={height}
                          onChange={(e) => {
                            setHeight(e.target.value);
                          }}
                        />
                      ) : (
                        <div class="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {height}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-2">
                      <label for="allergic">Allergic</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="allergic"
                          id="allergic"
                          class="transition-all flex items-center h-10 border mt-1 rounded px-2 w-full bg-gray-50"
                          value={allergic}
                          onChange={(e) => {
                            setAllergic(e.target.value);
                          }}
                        />
                      ) : (
                        <div class="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {allergic}
                        </div>
                      )}
                    </div>

                    <div class="md:col-span-2">
                      <label for="congenital_disease">Congenital Disease</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="congenital_disease"
                          id="congenital_disease"
                          class="transition-all flex items-center h-10 border mt-1 rounded px-2 w-full bg-gray-50"
                          value={congenital_disease}
                          onChange={(e) => {
                            setCongenitalDisease(e.target.value);
                          }}
                        />
                      ) : (
                        <div class="h-10 border mt-1 rounded px-2 w-full bg-gray-50 flex items-center justify-left">
                          {congenital_disease}
                        </div>
                      )}
                    </div>
                    <br />
                    <div class="md:col-span-4 text-right">
                      <div class="inline-flex items-end">
                        {isEditing === false ? (
                          <button
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={ChangeEditStatus}
                          >
                            Edit Profile
                          </button>
                        ) : (
                          <button
                            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            onClick={handleFormSubmit}
                          >
                            Save Profile
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
