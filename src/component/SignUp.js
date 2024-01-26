import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/SignUp.css';
import Navbar from "./navbar"
import { useLocation } from 'react-router-dom';

const SignUp = () => {
    // const location = useLocation();
    // const lineUserID = new URLSearchParams(location.search).get('lineUserID');
    

    // useEffect(() => {
    //     console.log("Line login user ID: ", lineUserID)
    // }, [lineUserID]);

    const sr = ScrollReveal({
      distance: '65px',
      duration: 2600,
      delay: 450,
      reset: true,
    });

    function submitForm() {
        var ReceivedLineUserID = localStorage.getItem("SendLineUserID");

        console.log("Line user ID in fc: ", ReceivedLineUserID)

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
            lineUserID: ReceivedLineUserID
        };

        fetch('http://localhost:5000/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (response.ok) {
                console.log('Form submitted successfully');
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
                        <label for="txtEmail">E-mail</label><br/>
                        <input type='email' id='txtEmail' required title='Required E-mail'/><br/>

                        <label for="txtIDcard">ID Card</label><br/>
                        <input type='text' id='txtIDcard' pattern='[0-9]{13}' required title='Required ID Card'/><br/>

                        <label for="txtFirstname">First name</label><br/>
                        <input type='text' id='txtFirstname' required title='Required First name'/><br/>

                        <label for="txtLastname">Last name</label><br/>
                        <input type='text' id='txtLastname' required title='Required Last name'/><br/>

                        <label for="txtPhone">Mobile Phone</label><br/>
                        <input type='text' name='mobile' pattern='[0-9]{3}[0-9]{3}[0-9]{4}' id='txtPhone' required/><br/>
                        
                        <label for="txtBD">Birthday</label><br/>
                        <input type='date' id='txtBD' required/><br/>

                        <label for="txtSex">Sex</label><br/>
                        <input type='radio' name='sex' id='txtSex' value='M' checked/> Male
                        <i></i>
                        <input type='radio' name='sex' id='txtSex' value='F'/> Female<br/>

                        <label for="txtWeight">Weight</label><br/>
                        <input type='text' id='txtWeight'/><br/>

                        <label for="txtHeight">Height</label><br/>
                        <input type='text' id='txtHeight'/><br/>

                        <label for="txtAllergy">Allergy</label><br/>
                        <input type='text' id='txtAllergy'/><br/>

                        <label for="txtDisease">Cognition Disease</label><br/>
                        <input type='text' id='txtDisease'/><br/>

                        <button type='submit' onClick={submitForm} className='SubmitBtn'>Sign Up</button>
                    </form>
                </div>
            </body>
        </div>
    );
}

export default SignUp;