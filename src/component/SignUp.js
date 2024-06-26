import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/SignUp.css';
import Navbar from "./navbar"
import { useLocation } from 'react-router-dom';

const SignUp = (props) => {
    const location = useLocation();
    // const LineUserID = new URLSearchParams(location.search).get('LineUserID');
    const LineUserID = localStorage.getItem('SendLineUserID');
    
    useEffect(() => {
        console.log("Line login user ID: ", LineUserID)
    }, [LineUserID]);

    const sr = ScrollReveal({
      distance: '65px',
      duration: 2600,
      delay: 450,
      reset: true,
    });

    function submitForm(event) {
        // var ReceivedLineUserID = localStorage.getItem("SendLineUserID");
        event.preventDefault();

        const NameRegex = /^[^\s][A-Za-z\s]{1,50}$/;
        const AllergicRegex = /^[^\s]{0,50}$/;
        const CongenitalDiseaseRegex = /^[^\s]{0,50}$/;

        const firstNameInput = document.getElementById("txtFirstname").value;
        const lastNameInput = document.getElementById("txtLastname").value;
        const allergicInput = document.getElementById("txtAllergy").value;
        const congenitalDiseaseInput = document.getElementById("txtDisease").value;

        if (!NameRegex.test(firstNameInput)) {
            alert("First Name field should not exceed 50 characters and must not start with a space.");
            return;
        } else if (!NameRegex.test(lastNameInput)) {
            alert("Last Name field should not exceed 50 characters and must not start with a space.");
            return;
        } else if (!AllergicRegex.test(allergicInput)) {
            alert("Allergic field should not exceed 50 characters and must not contain spaces.");
            return;
        } else if (!CongenitalDiseaseRegex.test(congenitalDiseaseInput)) {
            alert("Cognitive Disease field should not exceed 50 characters and must not contain spaces.");
            return;
        }

        console.log("Line user ID in fc: ", LineUserID);

        const data = {
            id: document.getElementById("txtIDcard").value,
            email: document.getElementById("txtEmail").value,
            fname: document.getElementById("txtFirstname").value,
            lname: document.getElementById("txtLastname").value,
            phone: document.getElementById("txtPhone").value,
            BD: document.getElementById("txtBD").value,
            sex: document.querySelector('input[name="sex"]:checked').value,
            weight: document.getElementById("txtWeight").value,
            height: document.getElementById("txtHeight").value,
            allergy: document.getElementById("txtAllergy").value,
            disease: document.getElementById("txtDisease").value,
            LineUserID: LineUserID
        };

        fetch('http://localhost:5000/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(async response => {
            if (response.ok) {
                console.log('Form submitted successfully');
                const result = await response.json();
                const { token } = result;
                console.log('JWT Token:', token);
                localStorage.setItem('token', token);
                window.location.href = `/user`;
            } else {
                console.error('Error submitting form:', response.status, response.statusText);
            }
        })
        .catch(error => console.error('Error submitting form:', error));
    }
  
    useEffect(() => {
      // Use ScrollReveal here
      sr.reveal('.reveal-container', { delay: 200, origin: 'top' });
      sr.reveal('.reveal-container2', { delay: 400, origin: 'right' });
    }, []); // Empty dependency array means this effect runs once when the component mounts

    return(
        <div>
            <head>
            <title>Sign Up Page</title>
            </head>

            <body class="SignUpPage">
                <Navbar />
                <div className='Content'>
                    <h1 className="SignUp-topic">Sign Up</h1>
                    <form name='signUp' onSubmit={submitForm}>
                        <label for="txtEmail">* E-mail</label><br/>
                        <input type='email' id='txtEmail' required pattern='^[^\s@]+@[^\s@]+\.[^\s@]+$' title='Please enter a valid E-mail'/><br/>

                        <label for="txtIDcard">* ID Card</label><br/>
                        <input type='text' id='txtIDcard' pattern='[0-9]{13}' required title='Please enter a valid ID Card'/><br/>

                        <label for="txtFirstname">* First name</label><br/>
                        <input type='text' id='txtFirstname' required pattern='^[^\s][A-Za-z\s]{1,50}$' title='First Name field should not exceed 50 characters'/><br/>

                        <label for="txtLastname">* Last name</label><br/>
                        <input type='text' id='txtLastname' required pattern='^[^\s][A-Za-z\s]{1,50}$' title='Last Name field should not exceed 50 characters'/><br/>

                        <label for="txtPhone">* Mobile Phone</label><br/>
                        <input type='text' name='mobile' pattern='[0-9]{3}[0-9]{3}[0-9]{4}' id='txtPhone' required title='Please enter a valid phone number (10 digits starting with 0)'/><br/>
                        
                        <label for="txtBD">* Birthday</label><br/>
                        <input type='date' id='txtBD' required pattern='^(?:19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$' title='Please enter a valid date in the format YYYY-MM-DD'/><br/>

                        <label for="txtSex">* Sex</label><br/>
                        <input type='radio' name='sex' id='txtSex' value='M' checked/> Male
                        <i></i>
                        <input type='radio' name='sex' id='txtSex' value='F'/> Female<br/>

                        <label for="txtWeight">* Weight</label><br/>
                        <input type='text' id='txtWeight' required pattern='^\d{1,3}(?:\.\d{1,2})?$' title='Please enter a valid weight'/><br/>

                        <label for="txtHeight">* Height</label><br/>
                        <input type='text' id='txtHeight' required pattern='^\d{1,3}(?:\.\d)?$' title='Please enter a valid height'/><br/>

                        <label for="txtAllergy">Allergy</label><br/>
                        <input type='text' id='txtAllergy' pattern='^[^\s]{0,50}$' title='Allergy field should not exceed 50 characters'/><br/>

                        <label for="txtDisease">Cognition Disease</label><br/>
                        <input type='text' id='txtDisease' pattern='^[^\s]{0,50}$' title='Cognitive Disease field should not exceed 50 characters'/><br/>

                        <button type='submit' className='SubmitBtn bg-green-500 text-white p-4 rounded-md w-full'>Sign Up</button>
                    </form>
                </div>
            </body>
        </div>
    );
}

export default SignUp;
