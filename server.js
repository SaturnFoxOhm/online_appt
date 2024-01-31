var express = require('express')
var cors = require('cors')
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ohm0817742474',
  database: 'healthcheckupplatform'
});

var app = express();

app.use(cors());
app.use(express.json());

const secret = 'mysecret';

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000')
});

function validate(token) {
  // is expired?
  try {
    const decoded = jwt.verify(token, 'mysecret'); // Replace 'yourSecretKey' with your actual secret key
    console.log('Token is valid:', decoded);
    return true;
  } catch (error) {
    console.error('Token validation failed:', error.message);
    return false;
    // Handle the case where the token is invalid
  }
}

app.get('/user-auth', async (req, res) => {
    const authToken = req.headers['authorization']
    console.log('authToken', authToken);
    if (authToken && authToken.startsWith('Bearer ')) {
      const token = authToken.substring(7, authToken.length); // Extract the token
      const isValid = validate(token)
      if (isValid == true) {
        res.status(200).send({ message:'Token is Valid'});    
      } else {
          res.status(500).send('Token is not Valid');
      }    
  } else {
      res.status(500).send('Token is not Found');
  }
});

app.post('/submit-form', function (req, res, next) {
  const { id, email, fname, lname, phone, BD, sex, weight, height, allergy, disease, lineUserId } = req.body;

  connection.query('INSERT INTO `userinfo` (`InfoID`, `email`, `first_name`, `last_name`, `birthday`, `sex`, `phone`, `weight`, `height`, `allergic`, `congenital_disease`, `LineUserID`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  [id, email, fname, lname, BD, sex, phone, weight, height, allergy, disease, lineUserId], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
    } 
    else {
        console.log('Form data inserted successfully');
        const payload = {
          sub: lineUserId,
        };
        const token = jwt.sign(payload, secret, {expiresIn: '10s'})
        res.status(200).send({ message:'Form data inserted successfully', token });
    }
  });
});

app.post('/store-line-login-data', async function (req, res, next) {
  const { lineUserId, displayName } = req.body;
  console.log(req.body);
  console.log('Received Line Login data:', { lineUserId, displayName });

  connection.query(
    'SELECT * FROM `lineaccount` WHERE `LineUserID` = ?',
    [lineUserId],
    (error, results) => {
      if (error) {
        console.error('Error checking existing data:', error);
        console.log(error)
        res.status(500).send('Internal Server Error');
      } else {
        if (results.length > 0) {
          // User already exists, do nothing
          console.log('User already exists in the database');
          // User token //
          const payload = {
            sub: lineUserId,
          };
          const token = jwt.sign(payload, secret, {expiresIn: '24h'})

          console.log(token);

          res.status(200).json({ message: 'User already exists in the database', token });

        } else {
          // User doesn't exist, insert into the database
          connection.query(
            'INSERT INTO `lineaccount` (`LineUserID`, `displayName`) VALUES (?, ?)',
            [lineUserId, displayName],
            (insertError, insertResults) => {
              if (insertError) {
                console.error('Error updating Line Login data:', insertError);
                res.status(500).send('Internal Server Error');
              } else {
                console.log('Line Login data stored successfully');
                // Send a redirect response to the client
                res.status(302).send('Line Login data stored successfully');
              }
            }
          );
        }
      }
    }
  );
});

app.post('/user-profile', (req, res) => {
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "Uda15171e876e434f23c22eaa70925bc7";

  if (!lineUserId) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease FROM `userinfo` WHERE `LineUserID` = ?',
    [lineUserId],
    (error, results) => {
      if (error) {
        console.error('Error fetching user profile data:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('User profile not found');
      }

      const userProfile = results[0];
      res.status(200).json(userProfile);
    }
  );
});

app.put('/update-profile', (req, res) => {
  const { id_number, first_name, last_name, email, phone_number, birthdate, gender, weight, height, allergic, congenital_disease} = req.body;
  console.log('firstname', first_name);

  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "Uda15171e876e434f23c22eaa70925bc7";

  connection.query(
    'UPDATE `userinfo` SET `email` = ?, `first_name` = ?, `last_name` = ?, `birthday` = ?, `sex` = ?, `phone` = ?, `weight` = ?, `height` = ?, `allergic` = ?, `congenital_disease` = ? WHERE `InfoID` = ? AND `LineUserID` = ?',
    [email, first_name, last_name, birthdate, gender, phone_number, weight, height, allergic, congenital_disease, id_number, lineUserId],
    (error, results) => {
      if (error) {
        console.error('Error executing update query:', error);
        res.status(500).send('Internal Server Error');
      } else {
        if (results.affectedRows > 0) {
          console.log('User profile updated successfully');
          res.status(200).send({ message: 'User profile updated successfully' });
        } else {
          console.log('No rows updated. User profile not found or no changes made.');
          res.status(404).send('User profile not found or no changes made.');
        }
      }
    }
  );
});



// Admin Service //

// Function for checking if the Token is valid or not
function validateAuth(token) {
  // is expired?
  try {
    const decoded = jwt.verify(token, 'mysecret'); // Replace 'yourSecretKey' with your actual secret key
    console.log('Token is valid:', decoded);
    if(decoded.role == 'admin'){
      return true;
    }
  } catch (error) {
    console.error('Token validation failed:', error.message);
    return false;
    // Handle the case where the token is invalid
  }
}

// Check the admin's token validation
app.get('/admin-auth', async (req, res) => {
    const authToken = req.headers['authorization']
    console.log('authToken', authToken);
    if (authToken && authToken.startsWith('Bearer ')) {
      const token = authToken.substring(7, authToken.length); // Extract the token
      const isValid = validateAuth(token)
      if (isValid == true) {
        res.status(200).send({ message:'Token is Valid'});    
      } else {
          res.status(500).send('Token is not Valid');
      }    
  } else {
      res.status(500).send('Token is not Found');
  }
});

// Send the Admin's information to the database
app.post('/admin-login', function (req, res, next) {
  const { AdminID, passwords } = req.body;

  connection.query('SELECT * FROM `adminaccount` WHERE `AdminID` = ? AND `passwords` = ?', 
  [AdminID, passwords], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
    } 
    else {
      if (results.length > 0) {
        console.log(results);
        const payload = {
          sub: AdminID,
          role: 'admin'
        };
        const token = jwt.sign(payload, secret, {expiresIn: '24h'})
        res.status(200).send({ message:'Form data inserted successfully', token });
      }
      else{
        res.status(500).send("No current Admin in database");
      }
    }
  });
});

// Get the Users' Appointment that admin is work on
// Function that help when working with asynchronous operations
function queryAsync(sql, values) {
  return new Promise((resolve, reject) => {
    connection.query(sql, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

app.get('/admin-get-users-appointment', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

        if (admin.length > 0) {
          const HospitalID = admin[0].HospitalID;
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, ap_status, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate FROM `appointment` WHERE `HospitalID` = ?', [HospitalID]);
          
          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const Date = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_name.push(result[0].first_name + ' ' + result[0].last_name);

                if (appointment.HospitalDate !== null) {
                  Date.push(appointment.HospitalDate);
                  Address.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  Date.push(appointment.OffSiteDate);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                }
              }

              Appointment_Status.push(appointment.ap_status);
              user_info.push({ AppointmentID, user_name, Date, Address, Appointment_Status });
            }

            res.status(200).send({ message: "Get All Users' Appointment", user_info });
          } else {
            res.status(500).send("There are no users' appointments");
          }
        }
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      res.status(500).send('Token is not valid');
    }
  } else {
    res.status(500).send('Token is not found');
  }
});

// Get the Seected Users' Appointment that admin is work on
app.get('/admin-get-users-appointment/:id', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

        if (admin.length > 0) {
          const HospitalID = admin[0].HospitalID;
          const Appointmentid = req.params.id;
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, ap_status, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate FROM `appointment` WHERE `HospitalID` = ? AND `AppointmentID` = ?' , [HospitalID, Appointmentid]);
          
          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {

              user_info.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_info.push(result[0].first_name + ' ' + result[0].last_name);

                if (appointment.HospitalDate !== null) {
                  user_info.push(appointment.HospitalDate);
                  user_info.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  user_info.push(appointment.OffSiteDate);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  user_info.push(address[0].ad_line1);
                  user_info.push(address[0].ad_line2);
                  user_info.push(address[0].province);
                  user_info.push(address[0].city);
                  user_info.push(address[0].zipcode);
                }
              } 
              user_info.push(appointment.ap_status);
            }
            res.status(200).send({ message: "Get A Users' Appointment", user_info });
          } else {
            res.status(500).send("There are no users' appointments");
          }
        }
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      res.status(500).send('Token is not valid');
    }
  } else {
    res.status(500).send('Token is not found');
  }
});

// Update the Users' Appointment Status that admin is work on and already selected
app.put('/update-appointment-status', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

        if (admin.length > 0) {
          const newStatuses = req.body;
          console.log(newStatuses);
            const currentStatus = await queryAsync('SELECT * FROM `appointment` WHERE `AppointmentID` = ?', [newStatuses.AppointmentID]);

            if (currentStatus.length > 0) {
              // Update the status in the database
              await queryAsync('UPDATE `appointment` SET `ap_status` = ? WHERE `AppointmentID` = ?', [newStatuses.newStatus, newStatuses.AppointmentID]);
            }
          }
          console.log('Update Complete');
          res.status(200).send('Update Complete');
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      console.error('Error:', error);
      res.status(500).send('Token is not valid');
    }
  } else {
    console.error('Error:', error);
    res.status(500).send('Token is not found');
  }
});
