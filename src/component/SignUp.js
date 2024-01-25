import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import '../css/SignUp.css';
import Navbar from "./navbar"

const SignUp = () => {
    const sr = ScrollReveal({
      distance: '65px',
      duration: 2600,
      delay: 450,
      reset: true,
    });

    function submitForm() {
        const id = document.getElementById("txtIDcard").value;
        const email = document.getElementById("txtEmail").value;
        const fname = document.getElementById("txtFirstname").value;
        const lname = document.getElementById("txtLastname").value;
        const phone = document.getElementById("txtPhone").value;
        const BD = document.getElementById("txtBD").value;
        const sex = document.querySelector('input[name="sex"]:checked').value;
        const weight = document.getElementById("txtWeight").value;
        const height = document.getElementById("txtHeight").value;
        const allergy = document.getElementById("txtAllergy").value;
        const disease = document.getElementById("txtDisease").value;

        fetch('http://localhost:5000/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, email, fname, lname, phone, BD, sex, weight, height, allergy, disease }),
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