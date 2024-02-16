var express = require('express')
var cors = require('cors')
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  // password: 'ohm0817742474',
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
        const token = jwt.sign(payload, secret, {expiresIn: '24h'})
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
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "U4ebe7073335e35c79999db25f173e744";

  if (!lineUserId) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease FROM `userinfo` WHERE `LineUserID` = ? and `relateTo` is null',
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

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "U4ebe7073335e35c79999db25f173e744";

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

app.post('/add-user-profile', (req, res) => {
  const { id, email, fname, lname, phone, BD, sex, weight, height, allergy, disease} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "U4ebe7073335e35c79999db25f173e744";

  if (!lineUserId) {
    return res.status(400).send('LineUserID is required');
  }
  connection.query(
    'SELECT `InfoID` FROM `userinfo` WHERE `LineUserID` = ? and `relateTo` is null',
    [lineUserId],
    (error, results) => {
      if (error) {
        console.error('Error fetching user profile data:', error);
        return res.status(500).send('Internal Server Error');
      }
      else if (results.length > 0) {
        connection.query(
          'INSERT INTO `userinfo` (`InfoID`, `email`, `first_name`, `last_name`, `birthday`, `sex`, `phone`, `weight`, `height`, `allergic`, `congenital_disease`,`relateTo`, `LineUserID`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [id, email, fname, lname, BD, sex, phone, weight, height, allergy, disease, results[0].InfoID, lineUserId],
          (error, results) => {
            if (error) {
              console.error('Error fetching user profile data:', error);
              return res.status(500).send('Internal Server Error');
            }
          }
        );
      }
    }
  );

});

app.post('/insert-address',(req, res) => {
  const {address1, address2, province, city, postcode, CurrentInfoID} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "U4ebe7073335e35c79999db25f173e744";

  if (!lineUserId) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT MAX(`AddressID`) FROM `useraddress`',
    (error, results) => {
      if (error) {
        console.error('Error insert user address:', error);
        return res.status(500).send('Internal Server Error');
      }
      else if (results.length > 0) {
        var maxAddressID = results[0]['MAX(`AddressID`)'];
        // console.log(maxAddressID);
        if (maxAddressID === null) {
          maxAddressID = 0;
          // console.log(maxAddressID);
        }
        var currentAddressID = maxAddressID + 1;
        connection.query(
          'INSERT INTO `useraddress` (`AddressID`, `ad_line1`, `ad_line2`, `province`, `city`, `zipcode`) VALUES (?, ?, ?, ?, ?, ?)',
          [currentAddressID, address1, address2, province, city, postcode],
          (error, results) => {
            if (error) {
              console.error('Error insert user address:', error);
              return res.status(500).send('Internal Server Error');
            }
          }
        );

        connection.query(
          'SELECT `InfoID` FROM `userinfo` WHERE `LineUserID` = ? and `relateTo` is null',
          [lineUserId],
          (error, results) => {
            console.log(results[0])
            if (error) {
              console.error('Error fetching user profile data:', error);
              return res.status(500).send('Internal Server Error');
            }
            else if (results.length > 0) {
              mainUserID = results[0]['InfoID'];
              if (CurrentInfoID == mainUserID) {
                connection.query(
                  'UPDATE `userinfo` SET `AddressID` = ? WHERE `InfoID` = ?',
                  [currentAddressID, CurrentInfoID]
                );
              }
              else {
                connection.query(
                  'UPDATE `userinfo` SET `AddressID` = ? WHERE `InfoID` = ? and `relateTo` = ?',
                  [currentAddressID, CurrentInfoID, mainUserID]
                );
              }
            }
          }
        );
      }
    }
  );
});

app.post('/hospital-list', (req, res) => {
  // Maybe use token with GPS

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "U4ebe7073335e35c79999db25f173e744";

  if (!lineUserId) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT HospitalID, hos_name, hos_tel, hos_region, hos_location, hos_type FROM `hospital`',
    (error, results) => {
      if (error) {
        console.error('Error fetching hospital data:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Hospital not found');
      }
      res.json(results);
    }
  );
});

app.post('/fetchTimeSlot', (req, res) => {
  const {selectedHospital, selectedDate} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub;
  // lineUserId = "U4ebe7073335e35c79999db25f173e744";

  if (!lineUserId) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT `hosSlotID`, `start_time`, `end_time` FROM `timeslothospital` WHERE `HospitalID` = ? AND `HospitalDate` = ? AND `amount` > 0',
    [selectedHospital, selectedDate],
    (error, results) => {
      if (error) {
        console.error('Error fetching hospital data:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Hospital not found');
      }
      res.json(results);
      console.log(results);
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

  connection.query('SELECT * FROM `adminaccount` WHERE `AdminID` = ? AND `passwords` = ? AND `roles` = ?', 
  [AdminID, passwords, 'admin'], (error, results) => {
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

// Get the Selected Users' Appointment that admin is work on
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

// Get the Users' Appointment (status is received) that admin is work on
app.get('/admin-get-users-appointment-only-received', async (req, res) => {
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
          const ap_status = "Received";
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, ap_status, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate FROM `appointment` WHERE `HospitalID` = ? AND `ap_status` = ?', [HospitalID, ap_status]);
          
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

// Get the Selected Users' Appointment (email) that admin is work on
app.get('/admin-get-users-appointment-only-received/:id', async (req, res) => {
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
                user_info.push(result[0].email);

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

app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "supakitt.sur@gmail.com",
      pass: "xfpe xgvp uxit eptu",
    },
  });

  const mailOptions = {
    from: 'supakitt.sur@gmail.com',
    to: to,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending email' });
  }
});

// Get all selected date's Time slot of the hospital that admin works to
app.post('/admin-get-timeslot', async (req, res) => {
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
          const HospitalDate = req.body.selectedDate;
          const results = await queryAsync('SELECT hosSlotID, amount, start_time, end_time FROM `timeslothospital` WHERE `HospitalDate` = ? AND `HospitalID` = ?', [HospitalDate, HospitalID]);

          if (results.length > 0) {
            const time_slot = [];

            for (const date of results) {
              const amount = [];
              const Start_time = [];
              const End_time = [];
              const hosSlotID = [];

              amount.push(date.amount);
              Start_time.push(date.start_time);
              End_time.push(date.end_time);
              hosSlotID.push(date.hosSlotID);

              time_slot.push({ hosSlotID, amount, Start_time, End_time });
            }
            console.log(time_slot);
            res.status(200).send({ message: "Get All Time Slot", time_slot });
          } else {
            res.status(500).send("There are no Time Slot");
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

// Update the selected date's Time slot of the hospital that admin works to
app.post('/admin-update-timeslot', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        const HospitalDate = req.body.selectedDate;
        const HospitalID = admin[0].HospitalID;
      
        if (admin.length > 0) {

          const hosSlotID = req.body.hosSlotID;
          const Amount = req.body.newAmount;

          // Update the existing time slot in the database
          await queryAsync('UPDATE `timeslothospital` SET amount = ? WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?', [Amount, HospitalID, HospitalDate, hosSlotID]);

          res.status(200).send({ message: "Time Slot updated successfully" });
        } else {
          res.status(500).send("Admin not found");
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




// Super Admin Service //

// Function for checking if the Token is valid or not
function validateSuperAuth(token) {
  // is expired?
  try {
    const decoded = jwt.verify(token, 'mysecret'); // Replace 'yourSecretKey' with your actual secret key
    console.log('Token is valid:', decoded);
    if(decoded.role == 'superadmin'){
      return true;
    }
  } catch (error) {
    console.error('Token validation failed:', error.message);
    return false;
    // Handle the case where the token is invalid
  }
}

// Check the super admin's token validation
app.get('/super-admin-auth', async (req, res) => {
    const authToken = req.headers['authorization']
    console.log('authToken', authToken);
    if (authToken && authToken.startsWith('Bearer ')) {
      const token = authToken.substring(7, authToken.length); // Extract the token
      const isValid = validateSuperAuth(token)
      if (isValid == true) {
        res.status(200).send({ message:'Token is Valid'});    
      } else {
          res.status(500).send('Token is not Valid');
      }    
  } else {
      res.status(500).send('Token is not Found');
  }
});

// Send the Super Admin's information to the database
app.post('/super-admin-login', function (req, res, next) {
  const { AdminID, passwords } = req.body;

  connection.query('SELECT * FROM `adminaccount` WHERE `AdminID` = ? AND `passwords` = ? AND `roles` = ?', 
  [AdminID, passwords, 'superadmin'], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
    } 
    else {
      if (results.length > 0) {
        console.log(results);
        const payload = {
          sub: AdminID,
          role: 'superadmin'
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

// Get all current admin account and their hospital name that they work on
app.get('/super-admin-get-all-admin', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const results = await queryAsync('SELECT adminaccount.AdminID, adminaccount.email, adminaccount.passwords, adminaccount.roles, hospital.hos_name FROM adminaccount INNER JOIN hospital ON adminaccount.HospitalID=hospital.HospitalID;');
        res.status(200).send({ message:'Get all current adminaccount', results });
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

// Get all current Hospital for signing up the admin
app.get('/super-admin-get-all-hospitals', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const results = await queryAsync('SELECT HospitalID, hos_name FROM `hospital`');
        res.status(200).send({ message:'Get all current hospitals', results });
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

// Insert new Admin in the database
app.post('/super-admin-insert-new-admin', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const newAdmin = req.body;
        queryAsync('INSERT INTO `adminaccount` (`AdminID`, `email`, `passwords`, `roles`, `HospitalID`) VALUES (?, ?, ?, ?, ?)',
        [newAdmin.AdminID, newAdmin.email, newAdmin.passwords, newAdmin.roles, newAdmin.HospitalID]);
        console.log("New admin inserted successfully!");
        res.status(200).send('New admin inserted successfully!');
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

// Insert new Admin in the database
app.delete('/delete-admin/:adminID', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const AdminID = parseInt(req.params.adminID);
        queryAsync('DELETE FROM `adminaccount` WHERE `AdminID`= ?', [AdminID]);
        console.log("Delete Admin successfully!");
        res.status(200).send('Delete Admin successfully!');
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

// Get All Users' Appointment
app.get('/super-admin-get-users-appointment', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

        if (admin.length > 0) {
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, ap_status, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate FROM `appointment`');
          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const Date = [];
              const Hospital = [];
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
              const hospital = await queryAsync('SELECT * FROM `hospital` WHERE `HospitalID` = ?', [appointment.HospitalID]);
              Hospital.push(hospital[0].hos_name);
              Appointment_Status.push(appointment.ap_status);
              user_info.push({ AppointmentID, user_name, Date, Address, Hospital, Appointment_Status });
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

// Get the Selected Users' Appointment 
app.get('/super-admin-get-users-appointment/:id', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

        if (admin.length > 0) {
          const Appointmentid = req.params.id;
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, ap_status, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate FROM `appointment` WHERE `AppointmentID` = ?' , [Appointmentid]);
          
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
              const hospital = await queryAsync('SELECT * FROM `hospital` WHERE `HospitalID` = ?', [appointment.HospitalID]);
              user_info.push(hospital[0].hos_name);
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

// Update the Users' Appointment Status that already selected
app.put('/super-admin-update-appointment-status', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
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

// Get all selected date's Time slot of the hospital that super admin works to
app.post('/super-admin-get-timeslot', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

        if (admin.length > 0) {
          const HospitalID = admin[0].HospitalID;
          const HospitalDate = req.body.selectedDate;
          const results = await queryAsync('SELECT hosSlotID, amount, start_time, end_time FROM `timeslothospital` WHERE `HospitalDate` = ? AND `HospitalID` = ?', [HospitalDate, HospitalID]);

          if (results.length > 0) {
            const time_slot = [];

            for (const date of results) {
              const amount = [];
              const Start_time = [];
              const End_time = [];
              const hosSlotID = [];

              amount.push(date.amount);
              Start_time.push(date.start_time);
              End_time.push(date.end_time);
              hosSlotID.push(date.hosSlotID);

              time_slot.push({ hosSlotID, amount, Start_time, End_time });
            }
            console.log(time_slot);
            res.status(200).send({ message: "Get All Time Slot", time_slot });
          } else {
            res.status(500).send("There are no Time Slot");
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

// Update the selected date's Time slot of the hospital that super admin works to
app.post('/super-admin-update-timeslot', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        const HospitalDate = req.body.selectedDate;
        const HospitalID = admin[0].HospitalID;
      
        if (admin.length > 0) {

          const hosSlotID = req.body.hosSlotID;
          const Amount = req.body.newAmount;

          // Update the existing time slot in the database
          await queryAsync('UPDATE `timeslothospital` SET amount = ? WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?', [Amount, HospitalID, HospitalDate, hosSlotID]);

          res.status(200).send({ message: "Time Slot updated successfully" });
        } else {
          res.status(500).send("Admin not found");
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
