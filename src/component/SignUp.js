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

            <body>
                <Navbar />
                <h1 className="SignUp-topic">Sign Up</h1>
                <form name='signUp' onSubmit="">
                    <label for="txtEmail">E-mail</label><br/>
                    <input type='email' id='txtEmail'/><br/>

                    <label for="txtIDcard">ID Card</label><br/>
                    <input type='text' id='txtIDcard'/><br/>

                    <label for="txtFirstname">First name</label><br/>
                    <input type='text' id='txtFirstname'/><br/>

                    <label for="txtLastname">Last name</label><br/>
                    <input type='text' id='txtLastname'/><br/>

                    <label for="txtPhone">Mobile Phone</label><br/>
                    <input type='tel' name='mobile' pattern='[0-9]{3}-[0-9]{3}-[0-9]{4}' id='txtPhone'/><br/>
                    
                    <label for="txtBD">Birthday</label><br/>
                    <input type='date' id='txtBD'/><br/>

                    <label for="txtSex">Sex</label><br/>
                    <input type='radio' name='sex' id='txtSex' value="Male" checked/>Male<br/>
                    <input type='radio' name='sex' id='txtSex' value="Female"/>Female<br/>

                    <label for="txtWeight">Weight</label><br/>
                    <input type='text' id='txtWeight'/><br/>

                    <label for="txtHeight">Height</label><br/>
                    <input type='text' id='txtHeight'/><br/>

                    <label for="txtAllergy">Allergy</label><br/>
                    <input type='text' id='txtAllergy'/><br/>

                    <label for="txtDisease">Cognition Disease</label><br/>
                    <input type='text' id='txtDisease'/><br/>

                    <button type='submit'>Sign Up</button>
                </form>
            </body>
        </div>
    );
}

export default SignUp;