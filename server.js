var express = require('express')
var cors = require('cors')
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const multer = require('multer'); // Add this line for handling file uploads
const buffer = require('buffer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

// qr genarate
const QRCode = require('qrcode');
const genaratePayload = require('promptpay-qr');
const _ = require('lodash');
const fs = require('fs');

// Configure multer for handling file uploads
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  // password: 'ohm0817742474',
  database: 'healthcheckupplatform'
});

var app = express();

app.use(cors());

app.use(express.json({limit: '100mb'}));

// app.use(fileUpload());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ parameterLimit:100000, extended: true }));

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
      if(token === "null"){
        res.status(500).send('Token is not Found');
      }
      else{
        const isValid = validate(token)
        const decoded = jwt.verify(token, 'mysecret');
        connection.query(
          'SELECT * FROM `userinfo` WHERE `LineUserID` = ?',
          [decoded.sub],
          (error, results) => {
            if (error) {
              console.error('Error executing query:', error);
              res.status(500).send('Internal Server Error');
            } 
            else{
              if (isValid == true && results.length > 0) {
                res.status(200).send({ message:'Token is Valid'});    
              } else if(isValid == true && results.length == 0){
                  res.status(400).send('No infomation in userinfo database');
              } else if(isValid != true){
                  res.status(500).send('Token is not Valid');
              } 
            }
        }); 
      } 
  } else {
      res.status(500).send('Token is not Found');
  }
});

app.post('/submit-form', function (req, res, next) {
  const { id, email, fname, lname, phone, BD, sex, weight, height, allergy, disease, LineUserID } = req.body;

  connection.query('INSERT INTO `userinfo` (`InfoID`, `email`, `first_name`, `last_name`, `birthday`, `sex`, `phone`, `weight`, `height`, `allergic`, `congenital_disease`, `LineUserID`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  [id, email, fname, lname, BD, sex, phone, weight, height, allergy, disease, LineUserID], (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
    } 
    else {
        console.log('Form data inserted successfully');
        const payload = {
          sub: LineUserID,
        };
        const token = jwt.sign(payload, secret, {expiresIn: '24h'})
        
        const decodedToken = jwt.decode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token is expired, clear localStorage
          res.status(401).send({ message: 'Token expired' });
        } else {
          // Token is valid, send it along with the response
          res.status(200).send({ message: 'Form data inserted successfully', token });
        }
    }
  });
});

app.post('/store-line-login-data', async function (req, res, next) {
  const { LineUserID, displayName } = req.body;
  console.log(req.body);
  console.log('Received Line Login data:', { LineUserID, displayName });

  connection.query(
    'SELECT * FROM `lineaccount` WHERE `LineUserID` = ?',
    [LineUserID],
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
            sub: LineUserID,
          };
          const token = jwt.sign(payload, secret, {expiresIn: '24h'})

          console.log(token);

          const decodedToken = jwt.decode(token);
          if (decodedToken.exp * 1000 < Date.now()) {
            // Token is expired, clear localStorage
            res.status(401).send({ message: 'Token expired' });
          } else {
            // Token is valid, send it along with the response
            res.status(200).send({ message: 'User already exists in the database', token });
          }

        } else {
          // User doesn't exist, insert into the database
          connection.query(
            'INSERT INTO `lineaccount` (`LineUserID`, `displayName`) VALUES (?, ?)',
            [LineUserID, displayName],
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
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease FROM `userinfo` WHERE `LineUserID` = ? and `relateTo` is null',
    [LineUserID],
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
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  connection.query(
    'UPDATE `userinfo` SET `email` = ?, `first_name` = ?, `last_name` = ?, `birthday` = ?, `sex` = ?, `phone` = ?, `weight` = ?, `height` = ?, `allergic` = ?, `congenital_disease` = ? WHERE `InfoID` = ? AND `LineUserID` = ?',
    [email, first_name, last_name, birthdate, gender, phone_number, weight, height, allergic, congenital_disease, id_number, LineUserID],
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

app.post('/user-appointment', (req, res) => {
  const authToken = req.headers['authorization'];
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  const LineUserID = decoded.sub;

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const fetchAllAppointment = `
    SELECT AppointmentID, first_name, last_name, hos_name, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID, LabStatus, a.HospitalID
    FROM Appointment a INNER JOIN userinfo u ON a.InfoID = u.InfoID INNER JOIN hospital h ON a.HospitalID = h.HospitalID
    WHERE a.LineUserID = ?
    ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC;`;

  const fetchTimeSlotHospital = `
    SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslothospital
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;`;

  const fetchTimeSlotOffSite = `
    SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslotoffsite
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;`;

  connection.query(
    fetchAllAppointment,
    [LineUserID],
    async (error, results) => {
      if (error) {
        console.error('Error fetching user appointment data:', error);
        return res.status(500).send('Internal Server Error');
      }
      if (results.length === 0) {
        return res.status(404).send('User appointment not found');
      } else {
        
        let appointmentsWithTimeSlots = [];
        for (let i = 0; i < results.length; i++) {
          let timeSlot;
          if (results[i].HospitalDate && results[i].hosSlotID) {
            timeSlot = await query(fetchTimeSlotHospital, [results[i].HospitalID, results[i].HospitalDate, results[i].hosSlotID]);
          } else if (results[i].OffSiteDate && results[i].offSlotID) {
            timeSlot = await query(fetchTimeSlotOffSite, [results[i].HospitalID, results[i].OffSiteDate, results[i].offSlotID]);
          }

          appointmentsWithTimeSlots.push({ appointment: results[i], timeSlot: timeSlot });
        }
        console.log(appointmentsWithTimeSlots)
        res.status(200).json({ appointmentsWithTimeSlots });
      }
    }
  );
});


app.post('/user-appointment/:date', (req, res) => {
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";
  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }
  const fetchAllAppointment = `
    SELECT AppointmentID, first_name, last_name, hos_name, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID, LabStatus, a.HospitalID
    FROM Appointment a INNER JOIN userinfo u ON a.InfoID = u.InfoID INNER JOIN hospital h ON a.HospitalID = h.HospitalID
    WHERE a.LineUserID = ?
    ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC;
  `;
  const fetchTimeSlotHospital = `
    SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslothospital
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
  `;
  const fetchTimeSlotOffSite = `
    SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslotoffsite
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
  `;
  connection.query(
    fetchAllAppointment,
    [LineUserID],
    async (error, results) => {
      if (error) {
        console.error('Error fetching user appointment data:', error);
        return res.status(500).send('Internal Server Error');
      }
      if (results.length === 0) {
        return res.status(404).send('User appointment not found');
      } else {
        let appointmentsWithTimeSlots = [];
        for (let i = 0; i < results.length; i++) {
          let timeSlot;
          const appointmentDate = results[i].HospitalDate || results[i].OffSiteDate;
          const appointmentYear = appointmentDate.split('-')[0];
          const appointmentMonth = appointmentDate.split('-')[1];
          const reqYear = req.params.date.split('-')[0];
          const reqMonth = req.params.date.split('-')[1];
          console.log(results[i].HospitalDate)
          console.log(results[i].hosSlotID)
          if (results[i].HospitalDate && results[i].hosSlotID && appointmentYear === reqYear && appointmentMonth === reqMonth) {
            timeSlot = await query(fetchTimeSlotHospital, [results[i].HospitalID, results[i].HospitalDate, results[i].hosSlotID]);
            appointmentsWithTimeSlots.push({ appointment: results[i], timeSlot: timeSlot });
          } else if (results[i].OffSiteDate && results[i].offSlotID && appointmentYear === reqYear && appointmentMonth === reqMonth) {
            timeSlot = await query(fetchTimeSlotOffSite, [results[i].HospitalID, results[i].OffSiteDate, results[i].offSlotID]);
            appointmentsWithTimeSlots.push({ appointment: results[i], timeSlot: timeSlot });
          }
        }
        res.status(200).json({ appointmentsWithTimeSlots });
      }
    }
  );
});

app.post('/user-appointment-details', async (req, res) => {
  const { AppointmentID } = req.body;
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";
  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }
  const fetchAppointmentbyID = `
    SELECT a.InfoID, CONCAT(first_name, " ", last_name) AS Name, a.HospitalID, hos_name, DATE_FORMAT(a.HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(a.OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID, OrderID, LabStatus
    FROM Appointment a INNER JOIN userinfo u ON a.InfoID = u.InfoID
    INNER JOIN Hospital h ON a.HospitalID = h.HospitalID
    WHERE a.LineUserID = ? AND AppointmentID = ?;
  `;
  const fetchTimeSlotHospital = `
    SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslothospital
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
  `;
  const fetchTimeSlotOffSite = `
    SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslotoffsite
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
  `;
  const fetchAddress = `
    SELECT ad_line1, ad_line2, province, city, zipcode
    FROM UserAddress UA INNER JOIN UserInfo UI ON UA.AddressID = UI.AddressID
    WHERE InfoID = ? AND LineUserID = ?;
  `;
  const fetchOrdersPackage = `
    SELECT th_package_name, en_package_name
    FROM OrdersDetails od INNER JOIN Package P ON od.PackageID = P.PackageID
    WHERE LineUserID = ? and OrderID = ?;
  `;
  const fetchOrdersDisease = `
    SELECT th_name, en_name
    FROM OrdersDetails od INNER JOIN Disease d ON od.DiseaseID = d.DiseaseID
    WHERE LineUserID = ? and OrderID = ?;
  `;
  const fetchOrdersLabTest = `
    SELECT th_name, en_name
    FROM OrdersDetails od INNER JOIN LabTest T ON od.TestID = T.TestID
    WHERE LineUserID = ? and OrderID = ?;
  `;
  try {
    const AppointInfo = await new Promise((resolve, reject) => {
      connection.query(fetchAppointmentbyID, [LineUserID, AppointmentID], (error, results) => {
        if (error) {
          console.error('Error getting Appoint Info:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
    if (AppointInfo.length === 0) {
      // Handle case where no appointment is found for the given ID
      console.error('No appointment found for AppointmentID:', AppointmentID);
      res.status(404).send('Appointment not found');
      return;
    }
    let timeSlot, Address;
    if (AppointInfo[0].HospitalDate && AppointInfo[0].hosSlotID) {
      timeSlot = await query(fetchTimeSlotHospital, [AppointInfo[0].HospitalID, AppointInfo[0].HospitalDate, AppointInfo[0].hosSlotID]);
    }
    else if (AppointInfo[0].OffSiteDate && AppointInfo[0].offSlotID) {
      timeSlot = await query(fetchTimeSlotOffSite, [AppointInfo[0].HospitalID, AppointInfo[0].OffSiteDate, AppointInfo[0].offSlotID]);
      Address = await query(fetchAddress, [AppointInfo[0].InfoID, LineUserID]);
    }
    const [PackageOrders, DiseaseOrders, LabTestOrders] = await Promise.all([
      query(fetchOrdersPackage, [LineUserID, AppointInfo[0].OrderID]),
      query(fetchOrdersDisease, [LineUserID, AppointInfo[0].OrderID]),
      query(fetchOrdersLabTest, [LineUserID, AppointInfo[0].OrderID])
    ]);
    if (Address) {
      res.status(200).json({ AppointInfo, timeSlot, Address, PackageOrders, DiseaseOrders, LabTestOrders });
    }
    else {
      Address = null;
      res.status(200).json({ AppointInfo, timeSlot, Address, PackageOrders, DiseaseOrders, LabTestOrders });
    }
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/time-options', async (req, res) => {
  const { selectedDate, place, Hos_id } = req.body;
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";
  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }
  const fetchAvailableDateHospital = `
    SELECT hosSlotID, CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslothospital
    WHERE HospitalID = ? AND HospitalDate = ? AND amount > 0;
  `;
  const fetchAvailableDateOffSite = `
    SELECT offSlotID, CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
    FROM timeslotoffsite
    WHERE HospitalID = ? AND OffSiteDate = ? AND amount > 0;
  `;
  let timeSlot;
  if (place === "Hospital") {
    timeSlot = await query(fetchAvailableDateHospital, [Hos_id, selectedDate]);
  }
  else if (place === "OffSite") {
    timeSlot = await query(fetchAvailableDateOffSite, [Hos_id, selectedDate]);
  }
  res.status(200).json(timeSlot);
});

app.post('/update-appointment-changes', async (req, res) => {
  const { AppointmentID, Hos_id, editedDate, editedSlot, place } = req.body;
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";
  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }
  const fetchAppointmentbyID = `
    SELECT DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID
    FROM Appointment
    WHERE LineUserID = ? AND AppointmentID = ?;
  `;
  const increaseHospitalSlot = `
    UPDATE timeslothospital
    SET amount = amount + 1
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
  `;
  const increaseOffSiteSlot = `
    UPDATE timeslotoffsite
    SET amount = amount + 1
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
  `;
  const decreaseHospitalSlot = `
    UPDATE timeslothospital
    SET amount = amount - 1
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
  `;
  const decreaseOffSiteSlot = `
    UPDATE timeslotoffsite
    SET amount = amount - 1
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
  `;
  const editAppointmentDetailsHospital = `
    UPDATE Appointment
    SET HospitalDate = ?, hosSlotID = ?
    WHERE Appointment.LineUserID = ? AND Appointment.AppointmentID = ?;
  `;
  const editAppointmentDetailsOffSite = `
    UPDATE Appointment
    SET OffSiteDate = ?, offSlotID = ?
    WHERE Appointment.LineUserID = ? AND Appointment.AppointmentID = ?;
  `;
  const AppointInfo = await new Promise((resolve, reject) => {
    connection.query(fetchAppointmentbyID,
    [LineUserID, AppointmentID], (error, results) => {
      if (error) {
        console.error('Error getting Appoint Info:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
  if (place === "Hospital") {
    await Promise.all([
      query(editAppointmentDetailsHospital, [editedDate, editedSlot, LineUserID, AppointmentID]),
      query(decreaseHospitalSlot, [Hos_id, editedDate, editedSlot]),
      query(increaseHospitalSlot, [Hos_id, AppointInfo[0].HospitalDate, AppointInfo[0].hosSlotID])
    ]);
  }
  else if (place === "OffSite") {
    await Promise.all([
      query(editAppointmentDetailsOffSite, [editedDate, editedSlot, LineUserID, AppointmentID, Hos_id]),
      query(decreaseOffSiteSlot, [Hos_id, editedDate, editedSlot]),
      query(increaseOffSiteSlot, [Hos_id, AppointInfo[0].OffSiteDate, AppointInfo[0].offSlotID])
    ]);
  }
  res.status(200).send('Edit successfully');;
});

app.post('/add-user-profile', (req, res) => {
  const { id, email, fname, lname, phone, BD, sex, weight, height, allergy, disease} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }
  connection.query(
    'SELECT `InfoID` FROM `userinfo` WHERE `LineUserID` = ? and `relateTo` is null',
    [LineUserID],
    (error, results) => {
      if (error) {
        console.error('Error fetching user profile data:', error);
        return res.status(500).send('Internal Server Error');
      }
      else if (results.length > 0) {
        connection.query(
          'SELECT `InfoID` FROM `userinfo` WHERE `InfoID` = ?',
          [id],
          (error, result) => {
            if (error) {
              console.error('Error fetching user profile data:', error);
              return res.status(500).send('Internal Server Error');
            }
            else if(result.length > 0){
              console.log("already exist")
              res.status(200).send('User already exist');;
            }
            else{
              connection.query(
                'INSERT INTO `userinfo` (`InfoID`, `email`, `first_name`, `last_name`, `birthday`, `sex`, `phone`, `weight`, `height`, `allergic`, `congenital_disease`,`relateTo`, `LineUserID`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [id, email, fname, lname, BD, sex, phone, weight, height, allergy, disease, results[0].InfoID, LineUserID],
                (error, results) => {
                  if (error) {
                    console.error('Error fetching user profile data:', error);
                    return res.status(500).send('Internal Server Error');
                  }
                  else{
                    console.log("Complete")
                    res.status(200).send('User data added successfully');
                  }
                }
              );
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
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const updateAddress = `
    UPDATE useraddress
    SET ad_line1 = ?, ad_line2 = ?, province = ?, city = ?, zipcode = ?
    WHERE AddressID = ?;
  `;

  connection.query(
    'SELECT AddressID FROM `userinfo` WHERE InfoID = ?',
    [CurrentInfoID],
    (error, results) => {
      if (error) {
        console.error('Error insert user address:', error);
        return res.status(500).send('Internal Server Error');
      }
      else if (results.length > 0) {
        if (results[0]['AddressID'] === null) {
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
                  [LineUserID],
                  (error, results) => {
                    console.log( results[0])
                    if (error) {
                      console.error('Error fetching user profile data:', error);
                      return res.status(500).send('Internal Server Error');
                    }
                    else if (results.length > 0) {
                      mainUserID = results[0]['InfoID'];
                      if (CurrentInfoID == mainUserID) {
                        connection.query(
                          'UPDATE `userinfo` SET `AddressID` = ? WHERE `InfoID` = ?',
                          [currentAddressID, CurrentInfoID],
                          (error, results) => {
                            res.json(results);
                          }
                        );
                      }
                      else {
                        connection.query(
                          'UPDATE `userinfo` SET `AddressID` = ? WHERE `InfoID` = ? and `relateTo` = ?',
                          [currentAddressID, CurrentInfoID, mainUserID],
                          (error, results) => {
                            res.json(results);
                          }
                        );
                      }
                    }
                    
                  }
                ); 
              }
            }
          );
        }
        else {
          query(updateAddress, [address1, address2, province, city, postcode, results[0]['AddressID']]);
          res.status(200).json(results);
        }
      }
    }
  );
});

app.get('/geocode', async (req, res) => {
  try {
      const address = req.query.address;
      const apiKey = 'AIzaSyCXeuTdudUzUXs_GazOer0Ya69gsij4Sag'; // Replace with your Google Maps API key
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const response = await axios.get(url);
      const data = response.data;
      if (data.results && data.results.length > 0) {
          const location = data.results[0].geometry.location;
          res.json({ lat: location.lat, lng: location.lng });
      } else {
          res.status(404).json({ error: 'Address not found' });
      }
  } catch (error) {
      console.error('Error geocoding address:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/hospital-list', (req, res) => {
  // Maybe use token with GPS

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT HospitalID, hos_name, hos_tel, hos_type, latitude, longitude FROM `hospital`',
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

app.get('/get-distance', async (req, res) => {
  try {
    const apiKey = 'AIzaSyCXeuTdudUzUXs_GazOer0Ya69gsij4Sag';
    const { origins, destinations, units } = req.query;

    const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=${units}&key=${apiKey}`;
    
    const response = await axios.get(apiUrl);

    if (response.data.status === "OK") {
      const distanceText = response.data.rows[0].elements[0].distance.text;
      res.json({ distance: distanceText });
    } else {
      console.error('Error fetching distance:', response.data.status);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } catch (error) {
    console.error('Error fetching distance:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/fetchTimeSlot', (req, res) => {
  const {selectedHospital, selectedDate, selectedPlace} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  if(selectedPlace === 'hospital'){
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
  }
  else if(selectedPlace === 'offsite'){
    connection.query(
      'SELECT `offSlotID`, `start_time`, `end_time` FROM `timeslotoffsite` WHERE `HospitalID` = ? AND `OffSiteDate` = ? AND `amount` > 0',
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
  }
  
});

app.post('/LabTest-list', (req, res) => {
  // Maybe use token with GPS

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT TestID, th_name, en_name, price, specimen FROM LabTest WHERE NHSO = 0',
    (error, results) => {
      if (error) {
        console.error('Error fetching Lab Test data:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Lab Test not found');
      }
      res.json(results);
    }
  );
});

app.post('/LabTest-NHSOlist', (req, res) => {
  // Maybe use token with GPS

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT TestID, th_name, en_name, price, specimen FROM LabTest WHERE NHSO = 1',
    (error, results) => {
      if (error) {
        console.error('Error fetching Lab Test data:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Lab Test not found');
      }
      res.json(results);
    }
  );
});

app.post('/add-labTest', (req, res) => {
  const {TestID} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const checkDuplicateQuery = `
    SELECT 1 FROM Cart WHERE TestID = ? AND LineUserID = ?
  `;

  const sqlQuery = `
    INSERT INTO Cart (LineUserID, Numbers, TestID)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM Cart WHERE TestID = ? AND LineUserID = ?
    );
  `;

  connection.query(checkDuplicateQuery, [TestID, LineUserID], 
    (error, results) => {
      if (error) {
        console.error('Error checking duplicate test:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
        // Test already exists in Cart
        return res.status(400).send('This test has already been added');
      }

      connection.query(
        'SELECT MAX(`Numbers`) FROM `cart` WHERE `LineUserID` = ?',
        [LineUserID],
        (error, results) => {
          if (error) {
            console.error('Error check max:', error);
            return res.status(500).send('Internal Server Error');
          }
          else if (results.length > 0) {
            var maxNumbers = results[0]['MAX(`Numbers`)'];
            // console.log(maxNumbers);
            if (maxNumbers === null) {
              maxNumbers = 0;
              // console.log(maxNumbers);
            }
            var currentNumbers = maxNumbers + 1;
            connection.query(
              sqlQuery,[LineUserID, currentNumbers, TestID, TestID, LineUserID],
              (error, results) => {
                if (error) {
                  console.error('Error insert selected Lab test:', error);
                  return res.status(500).send('Internal Server Error');
                }
                res.json(results);
              }
            );
          }
        }
      );
    }
  );
});

app.post('/Disease-list', (req, res) => {

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT DiseaseID, th_name, en_name, price FROM `Disease`',
    (error, results) => {
      if (error) {
        console.error('Error fetching Disease data:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Disease not found');
      }
      res.json(results);
    }
  );
});

app.post('/Disease-details', (req, res) => {
  const {DiseaseID} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const sqlQuery = `
    SELECT DiseaseID, DiseaseDetails.TestID, th_name, en_name, specimen
    FROM DiseaseDetails
    INNER JOIN LabTest ON LabTest.TestID = DiseaseDetails.TestID
    WHERE DiseaseID = ?
  `;

  connection.query(
    sqlQuery,[DiseaseID],
    (error, results) => {
      if (error) {
        console.error('Error fetching Disease details:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Disease details not found');
      }
      res.json(results);
    }
  );
});

app.post('/add-disease', (req, res) => {
  const {DiseaseID} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const checkDuplicateQuery = `
    SELECT 1 FROM Cart WHERE DiseaseID = ? AND LineUserID = ?
  `;

  const sqlQuery = `
    INSERT INTO Cart (LineUserID, Numbers, DiseaseID)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM Cart WHERE DiseaseID = ? AND LineUserID = ?
    );
  `;

  connection.query(checkDuplicateQuery, [DiseaseID, LineUserID], 
    (error, results) => {
      if (error) {
        console.error('Error checking duplicate test:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
        // Test already exists in Cart
        return res.status(400).send('This test has already been added');
      }

      connection.query(
        'SELECT MAX(`Numbers`) FROM `cart` WHERE `LineUserID` = ?',
        [LineUserID],
        (error, results) => {
          if (error) {
            console.error('Error check max:', error);
            return res.status(500).send('Internal Server Error');
          }
          else if (results.length > 0) {
            var maxNumbers = results[0]['MAX(`Numbers`)'];
            // console.log(maxNumbers);
            if (maxNumbers === null) {
              maxNumbers = 0;
              // console.log(maxNumbers);
            }
            var currentNumbers = maxNumbers + 1;
            connection.query(
              sqlQuery,[LineUserID, currentNumbers, DiseaseID, DiseaseID, LineUserID],
              (error, results) => {
                if (error) {
                  console.error('Error insert selected disease:', error);
                  return res.status(500).send('Internal Server Error');
                }
                res.json(results);
              }
            );
          }
        }
      );
    }
  );
});

app.post('/Package-list', (req, res) => {

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  connection.query(
    'SELECT PackageID, th_package_name, en_package_name, price FROM `Package`',
    (error, results) => {
      if (error) {
        console.error('Error fetching Package data:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Package not found');
      }
      res.json(results);
    }
  );
});

app.post('/Package-details', (req, res) => {
  const {PackageID} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const sqlQuery = `
    SELECT PackageID, PackageDetails.TestID, th_name, en_name, specimen
    FROM PackageDetails
    INNER JOIN LabTest ON LabTest.TestID = PackageDetails.TestID
    WHERE PackageID = ?
  `;

  connection.query(
    sqlQuery,[PackageID],
    (error, results) => {
      if (error) {
        console.error('Error fetching Package details:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length === 0) {
        return res.status(404).send('Package details not found');
      }
      res.json(results);
    }
  );
});

app.post('/add-package', (req, res) => {
  const {PackageID} = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const checkDuplicateQuery = `
    SELECT 1 FROM Cart WHERE PackageID = ? AND LineUserID = ?
  `;

  const sqlQuery = `
    INSERT INTO Cart (LineUserID, Numbers, PackageID)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
      SELECT 1 FROM Cart WHERE PackageID = ? AND LineUserID = ?
    );
  `;

  connection.query(checkDuplicateQuery, [PackageID, LineUserID], 
    (error, results) => {
      if (error) {
        console.error('Error checking duplicate test:', error);
        return res.status(500).send('Internal Server Error');
      }

      if (results.length > 0) {
        // Test already exists in Cart
        return res.status(400).send('This test has already been added');
      }

      connection.query(
        'SELECT MAX(`Numbers`) FROM `cart` WHERE `LineUserID` = ?',
        [LineUserID],
        (error, results) => {
          if (error) {
            console.error('Error check max:', error);
            return res.status(500).send('Internal Server Error');
          }
          else if (results.length > 0) {
            var maxNumbers = results[0]['MAX(`Numbers`)'];
            // console.log(maxNumbers);
            if (maxNumbers === null) {
              maxNumbers = 0;
              // console.log(maxNumbers);
            }
            var currentNumbers = maxNumbers + 1;
            connection.query(
              sqlQuery,[LineUserID, currentNumbers, PackageID, PackageID, LineUserID],
              (error, results) => {
                if (error) {
                  console.error('Error insert selected package:', error);
                  return res.status(500).send('Internal Server Error');
                }
                res.json(results);
              }
            );
          }
        }
      );
    }
  );
});

const util = require('util');
const query = util.promisify(connection.query).bind(connection);

app.post('/CartList', async (req, res) => {
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const packageQuery = `
    SELECT c.PackageID, th_package_name, en_package_name, price
    FROM Cart c INNER JOIN Package p on c.PackageID = p.PackageID
    WHERE LineUserID = ?
  `;
  const diseaseQuery = `
    SELECT c.DiseaseID, th_name, en_name, price
    FROM Cart c INNER JOIN Disease d on c.DiseaseID = d.DiseaseID
    WHERE LineUserID = ?
  `;
  const labTestQuery = `
    SELECT c.TestID, th_name, en_name, price, specimen, NHSO, main5Test
    FROM Cart c INNER JOIN LabTest l on c.TestID = l.TestID
    WHERE LineUserID = ?
  `;

  try {
    // Execute multiple queries concurrently
    const [packageCart, diseaseCart, labTestCart] = await Promise.all([
      query(packageQuery, [LineUserID]),
      query(diseaseQuery, [LineUserID]),
      query(labTestQuery, [LineUserID])
    ]);

    res.json({ packageCart, diseaseCart, labTestCart });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/del-CartList', (req, res) => {
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }
  
  const { itemType, itemID } = req.body;
  let columnName;

  console.log(itemID);

  // Check the type of itemID
  if (typeof itemType !== 'undefined') {
      if (itemType === "Package") {
          console.log('PackageID:', itemID);
          columnName = 'PackageID';
      } 
      else if (itemType === "Disease") {
          console.log('DiseaseID:', itemID);
          columnName = 'DiseaseID';
      } 
      else if (itemType === "LabTest") {
          console.log('TestID:', itemID);
          columnName = 'TestID';
      } 
      else {
          console.error('Unknown itemID:', itemID);
      }
      
      const delCartQuery = `
        DELETE FROM Cart
        WHERE LineUserID = ? AND ${columnName} = ?;
      `;

      connection.query(
        delCartQuery,
        [LineUserID, itemID],
        (error, results) => {
            if (error) {
                console.error('Error deleting item from Cart:', error);
                return res.status(500).send('Internal Server Error');
            }
            res.json(results);
        }
      );
  } else {
      res.status(400).send('No itemID provided');
  }
});

app.post('/Orders', (req, res) => {
  const { totalPrice, selectedItems } = req.body;

  console.log(totalPrice);
  console.log(selectedItems);

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const insertOrder = `
    INSERT INTO Orders (LineUserID, OrderID, order_status)
    VALUES (?, ?, "Waiting");
  `;

  const insertOrderDetails = `
    INSERT INTO OrdersDetails (LineUserID, OrderID, o_number, PackageID, DiseaseID, TestID, specimen)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  connection.query(
    'SELECT MAX(`OrderID`) FROM `Orders`',
    (error, results) => {
      if (error) {
        console.error('Error check max:', error);
        return res.status(500).send('Internal Server Error');
      }
      else if (results.length > 0) {
        var maxOrderID = results[0]['MAX(`OrderID`)'];
        console.log(maxOrderID);
        if (maxOrderID === null) {
          maxOrderID = 0;
          console.log(maxOrderID);
        }
        var currentOrderID = maxOrderID + 1;
        connection.query(
          insertOrder,[LineUserID, currentOrderID],
          (error, results) => {
            if (error) {
              console.error('Error insert into orders:', error);
              return res.status(500).send('Internal Server Error');
            }
            
            selectedItems.forEach((item, index) => {
              const { itemType, itemID, specimen } = item;
              const currentOrderNum = index + 1; // Assuming order number starts from 1

              let PackageID = null; 
              let DiseaseID = null;
              let TestID = null;

              if (itemType === "Package") {
                PackageID = itemID;
              }
              else if (itemType === "Disease") {
                DiseaseID = itemID;
              }
              else if (itemType === "LabTest") {
                TestID = itemID;
              }
  
              connection.query(
                insertOrderDetails, [LineUserID, currentOrderID, currentOrderNum, PackageID, DiseaseID, TestID, specimen],
                (error, results) => {
                  if (error) {
                    console.error('Error inserting into OrdersDetails:', error);
                    return res.status(500).send('Internal Server Error');
                  }
                }
              );
            });

            res.json(results);
          }
        );
      }
    }
  );
});

app.post('/appointment-info', async (req, res) => {
  const { InfoID, selectedSlot, selectedHospital, selectedDate, selectedPlace } = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const fetchUserInfo = `
    SELECT InfoID, email, first_name, last_name, birthday, sex, phone, weight, height, allergic, congenital_disease
    FROM UserInfo
    WHERE InfoID = ? AND LineUserID = ?;
  `;

  const fetchHospital = `
    SELECT hos_name
    FROM Hospital
    WHERE HospitalID = ?;
  `;

  const fetchAddress = `
    SELECT ad_line1, ad_line2, province, city, zipcode
    FROM UserAddress Ad INNER JOIN UserInfo U ON Ad.AddressID = U.AddressID
    WHERE InfoID = ? AND LineUserID = ?;
  `;

  const fetchDateTimeHospital = `
    SELECT HospitalDate, start_time, end_time
    FROM TimeSlotHospital
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
  `;

  const fetchDateTimeOffSite = `
    SELECT OffSiteDate, start_time, end_time
    FROM TimeSlotOffSite
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
  `;

  // Current Order from that User
  const fetchOrdersPackage = `
    SELECT th_package_name, en_package_name, specimen
    FROM OrdersDetails od INNER JOIN Package P ON od.PackageID = P.PackageID
    WHERE LineUserID = ? and OrderID = ?;
  `;

  const fetchOrdersDisease = `
    SELECT th_name, en_name, specimen
    FROM OrdersDetails od INNER JOIN Disease d ON od.DiseaseID = d.DiseaseID
    WHERE LineUserID = ? and OrderID = ?;
  `;

  const fetchOrdersLabTest = `
    SELECT th_name, en_name, od.specimen
    FROM OrdersDetails od INNER JOIN LabTest T ON od.TestID = T.TestID
    WHERE LineUserID = ? and OrderID = ?;
  `;

  try {
    // Execute multiple queries concurrently
    const [userInfo, hospital] = await Promise.all([
      query(fetchUserInfo, [InfoID, LineUserID]),
      query(fetchHospital, [selectedHospital])
    ]);

    let DateTime, Address;
    if (selectedPlace === "hospital") {
      DateTime = await query(fetchDateTimeHospital, [selectedHospital, selectedDate, selectedSlot]);
    }
    else if (selectedPlace === "offsite") {
      DateTime = await query(fetchDateTimeOffSite, [selectedHospital, selectedDate, selectedSlot]);
      Address = await query(fetchAddress, [InfoID, LineUserID]);
    }

    const CurrentOrderID = await new Promise((resolve, reject) => {
      connection.query("SELECT MAX(OrderID) FROM `Orders` WHERE `LineUserID` = ?", [LineUserID], (error, results) => {
        if (error) {
          console.error('Error getting max OrderID:', error);
          reject(error);
        } else {
          resolve(results[0]['MAX(OrderID)']);
        }
      });
    });

    const [PackageOrders, DiseaseOrders, LabTestOrders] = await Promise.all([
      query(fetchOrdersPackage, [LineUserID, CurrentOrderID]),
      query(fetchOrdersDisease, [LineUserID, CurrentOrderID]),
      query(fetchOrdersLabTest, [LineUserID, CurrentOrderID])
    ]);

    res.json({ userInfo, hospital, Address, DateTime, PackageOrders, DiseaseOrders, LabTestOrders });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/confirm-appointment', async (req, res) => {
  const { InfoID, selectedHospital, selectedDate, selectedSlot, selectedPlace } = req.body;

  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const InsertAppointmentHospital = `
    INSERT INTO Appointment (LineUserID, AppointmentID, InfoID, HospitalID, HospitalDate, hosSlotID, OrderID, LabStatus, book_datetime)
    VALUE (?, ?, ?, ?, ?, ?, ?, "Waiting", NOW());
  `;

  const InsertAppointmentOffSite = `
    INSERT INTO Appointment (LineUserID, AppointmentID, InfoID, HospitalID, AddressID, OffSiteDate, offSlotID, OrderID, LabStatus, book_datetime)
    VALUE (?, ?, ?, ?, ?, ?, ?, ?, "Waiting", NOW());
  `;

  const fetchAddress = `
    SELECT AddressID
    FROM UserInfo
    WHERE InfoID = ? AND LineUserID = ?;
  `;

  const UpdateOrder = `
    Update Orders
    SET order_status = "Confirm"
    WHERE LineUserID = ? AND OrderID = ?;
  `;

  try {
    const CurrentAppointmentID = await new Promise((resolve, reject) => {
      connection.query("SELECT MAX(AppointmentID) FROM `appointment`", 
      (error, results) => {
        if (error) {
          console.error('Error getting max AppointmentID', error);
          reject(error);
        } else if (results.length > 0){
          var maxAppointmentID = results[0]['MAX(AppointmentID)'];
          if (maxAppointmentID === null) {
            maxAppointmentID = 0;
          }
          var currentAppID = maxAppointmentID + 1;
          resolve(currentAppID);
        }
      });
    });

    const CurrentOrderID = await new Promise((resolve, reject) => {
      connection.query("SELECT MAX(OrderID) FROM `Orders` WHERE `LineUserID` = ?", [LineUserID], (error, results) => {
        if (error) {
          console.error('Error getting max OrderID:', error);
          reject(error);
        } else {
          resolve(results[0]['MAX(OrderID)']);
        }
      });
    });

    let AddressID;
    if (selectedPlace === "hospital") {
      await query(InsertAppointmentHospital, [LineUserID, CurrentAppointmentID, InfoID, selectedHospital, selectedDate, selectedSlot, CurrentOrderID]);
    }
    else if (selectedPlace === "offsite") {
      AddressID = await query(fetchAddress, [InfoID, LineUserID]);
      await query(InsertAppointmentOffSite, [LineUserID, CurrentAppointmentID, InfoID, selectedHospital, AddressID[0].AddressID, selectedDate, selectedSlot, CurrentOrderID]);
    }

    await Promise.all([
      query(UpdateOrder, [LineUserID, CurrentOrderID]),
    ]);

    res.status(200).send('Insert Appointment successfully');

  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/Insert-Payment', async (req, res) => {
  const { totalPrice, datetime } = req.body;

  console.log(req.body);



  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const InsertPayment = `
    INSERT INTO Payment (LineUserID, PaymentID, payment_method, bank_name, payment_amount, payment_status, payment_datetime)
    VALUE (?, ?, "E-Payment", "NU_BANK", ?, "Waiting", ?);
  `;

  const UpdatePaymentID = `
    Update Orders
    SET PaymentID = ?
    WHERE LineUserID = ? AND OrderID = ?;
  `;

  const PaymentDetails = `
    SELECT payment_amount, payment_datetime
    FROM Payment
    WHERE LineUserID = ? AND PaymentID = ?
  `;

  const CurrentPaymentID = await new Promise((resolve, reject) => {
    connection.query("SELECT MAX(PaymentID) FROM `Payment` WHERE `LineUserID` = ?", 
    [LineUserID], 
    (error, results) => {
      if (error) {
        console.error('Error getting max PaymentID:', error);
        reject(error);
      } else if (results.length > 0){
        var maxPaymentID = results[0]['MAX(PaymentID)'];
        if (maxPaymentID === null) {
          maxPaymentID = 0;
        }
        var currentPayID = maxPaymentID + 1;
        resolve(currentPayID);
      }
    });
  });

  const CurrentOrderID = await new Promise((resolve, reject) => {
    connection.query("SELECT MAX(OrderID) FROM `Orders` WHERE `LineUserID` = ?", [LineUserID], (error, results) => {
      if (error) {
        console.error('Error getting max OrderID:', error);
        reject(error);
      } else {
        resolve(results[0]['MAX(OrderID)']);
      }
    });
  });

  await Promise.all([
    query(InsertPayment, [LineUserID, CurrentPaymentID, totalPrice, formatDate(datetime)]),
    query(UpdatePaymentID, [CurrentPaymentID, LineUserID, CurrentOrderID]),
  ]);

  const paymentDetails = await query(PaymentDetails, [LineUserID, CurrentPaymentID])

  res.json({ paymentDetails });
});

app.post('/check-payment', async (req, res) => {
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  console.log("Hello World");

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const UpdatePaymentStatus = `
    UPDATE Payment
    SET payment_status = "Success"
    WHERE LineUserID = ? AND PaymentID = ?;
  `;

  const DecreaseTimeSlotHospital = `
    UPDATE TimeSlotHospital
    SET amount = amount - 1
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
  `;

  const DecreaseTimeSlotOffSite = `
    UPDATE TimeSlotOffSite
    SET amount = amount - 1
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
  `;

  const StuckOrderDetails = `
    DELETE FROM OrdersDetails 
    WHERE LineUserID = ? AND OrderID IN (SELECT OrderID FROM Orders WHERE LineUserID = ? AND OrderID < ? AND order_status = "Waiting");
  `;
  
  const StuckOrder = `
    DELETE FROM Orders WHERE LineUserID = ? AND OrderID < ? AND order_status = "Waiting";
  `;

  const ClearTestinCart = `
    DELETE FROM Cart 
    WHERE LineUserID = ? AND (
      PackageID IN (SELECT PackageID FROM OrdersDetails WHERE LineUserID = ? AND OrderID = ?) OR
      DiseaseID IN (SELECT DiseaseID FROM OrdersDetails WHERE LineUserID = ? AND OrderID = ?) OR
      TestID IN (SELECT TestID FROM OrdersDetails WHERE LineUserID = ? AND OrderID = ?)
    );
  `;

  const StuckAppointment = `
    DELETE FROM appointment
    WHERE AppointmentID IN (
        SELECT a.AppointmentID
        FROM (
            SELECT AppointmentID, OrderID
            FROM appointment
            WHERE LineUserID = ?
        ) AS a
        INNER JOIN orders o ON a.OrderID = o.OrderID
        INNER JOIN payment p ON o.PaymentID = p.PaymentID
        WHERE p.payment_status = 'Waiting' AND a.AppointmentID < ?
    );
  `;

  const CreateReceipt = `
    INSERT INTO Receipt (LineUserID, ReceiptID, receipt_datetime, InfoID, PaymentID)
    VALUE (?, ?, NOW(), ?, ?);
  `;

  const CurrentPaymentID = await new Promise((resolve, reject) => {
    connection.query('SELECT MAX(PaymentID) FROM `Payment` WHERE `LineUserID` = ?', [LineUserID], 
    (error, results) => {
      if (error) {
        console.error('Error getting max PaymentID:', error);
        reject(error);
      } else if (results.length > 0){
        resolve(results[0]['MAX(PaymentID)']);
      }
    });
  });

  await query(UpdatePaymentStatus, [LineUserID, CurrentPaymentID]);

  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  try {
    const CurrentAppointmentID = await new Promise((resolve, reject) => {
      connection.query(
          'SELECT MAX(AppointmentID) AS maxAppointmentID FROM `appointment` WHERE `LineUserID` = ?', 
          [LineUserID], 
          (error, results) => {
              if (error) {
                  console.error('Error getting max AppointmentID:', error);
                  reject(error);
              } else {
                  const maxAppointmentID = results[0].maxAppointmentID;
                  resolve(maxAppointmentID);
              }
          }
      );
    });  
    console.log(CurrentAppointmentID);

    const AppointInfo = await new Promise((resolve, reject) => {
      connection.query('SELECT HospitalID, HospitalDate, hosSlotID, OffSiteDate, offSlotID, OrderID FROM `appointment` WHERE `LineUserID` = ? AND `AppointmentID` = ?', 
      [LineUserID, CurrentAppointmentID], (error, results) => {
        if (error) {
          console.error('Error getting Appoint Info:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const hospitalDate = AppointInfo[0].HospitalDate ? formatDate(AppointInfo[0].HospitalDate) : null;
    const offSiteDate = AppointInfo[0].OffSiteDate ? formatDate(AppointInfo[0].OffSiteDate) : null;

    if (hospitalDate && AppointInfo[0].hosSlotID) {
      console.log("Hospital");
      await query(DecreaseTimeSlotHospital, [AppointInfo[0].HospitalID, hospitalDate, AppointInfo[0].hosSlotID]);
    }
    else if (offSiteDate && AppointInfo[0].offSlotID) {
      console.log("OffSite");
      await query(DecreaseTimeSlotOffSite, [AppointInfo[0].HospitalID, offSiteDate, AppointInfo[0].offSlotID]);
    }

    await query(StuckAppointment, [LineUserID, CurrentAppointmentID]);

    const CurrentOrderID = await new Promise((resolve, reject) => {
      connection.query('SELECT OrderID FROM `appointment` WHERE `LineUserID` = ? AND `AppointmentID` = ?', 
      [LineUserID, CurrentAppointmentID], (error, results) => {
        if (error) {
          console.error('Error getting Current Order ID:', error);
          reject(error);
        } else {
          resolve(results[0].OrderID);
        }
      });
    });

    await Promise.all([
      query(StuckOrderDetails, [LineUserID, LineUserID, CurrentOrderID]),
      query(StuckOrder, [LineUserID, CurrentOrderID])
    ]);

    await query(ClearTestinCart, [LineUserID, LineUserID, CurrentOrderID, LineUserID, CurrentOrderID, LineUserID, CurrentOrderID]);

    const CurrentReceiptID = await new Promise((resolve, reject) => {
      connection.query('SELECT MAX(ReceiptID) FROM `Receipt` WHERE `LineUserID` = ?', 
      [LineUserID], 
      (error, results) => {
        if (error) {
          console.error('Error getting max PaymentID:', error);
          reject(error);
        } else if (results.length > 0){
          var maxReceiptID = results[0]['MAX(ReceiptID)'];
          if (maxReceiptID === null) {
            maxReceiptID = 0;
          }
          var currentReceiptID = maxReceiptID + 1;
          resolve(currentReceiptID);
        }
      });
    });

    console.log(CurrentReceiptID);

    const CurrentInfoID = await new Promise((resolve, reject) => {
      connection.query('SELECT InfoID FROM `appointment` WHERE `LineUserID` = ? AND `AppointmentID` = ?', 
      [LineUserID, CurrentAppointmentID], (error, results) => {
        if (error) {
          console.error('Error getting Current Info ID:', error);
          reject(error);
        } else {
          resolve(results[0].InfoID);
        }
      });
    });

    console.log(CurrentInfoID);

    await query(CreateReceipt, [LineUserID, CurrentReceiptID, CurrentInfoID, CurrentPaymentID]);

    res.status(200).send('Appointment Successfully');

  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/check-slip',upload.single('file'), async (req, res) => {
  console.log("Hello")
  const file = req.file;
  const apiKey = '5bd4346e-a4d7-4177-8066-c324e2ed6602';

  console.log(req)
  console.log(file)

  const formData = new FormData();
    formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
    });

  try {
    // // Check if file is a .jpg or .png
    // const fileExt = path.extname(file.originalname);
    // if (fileExt !== '.jpg' && fileExt !== '.png') {
    //   throw new Error('Invalid file format. Only .jpg and .png files are allowed.');
    // }

    const response = await axios.post('https://developer.easyslip.com/api/v1/verify', formData , {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer 5bd4346e-a4d7-4177-8066-c324e2ed6602`,
      },
    });

    res.json(response.data);
    console.log(JSON.stringify(response.data));
    console.log(req.body);
  } catch (error) {
    console.error('Error calling EasySlip API:', error.response.data);
    res.status(500).json({ error: 'Failed to verify slip' });
  }
});

app.post('/generateQR', (req, res) => {
  const amount = parseFloat(_.get(req, ["body", "amount"]));
  const mobileNumber = '0847245668';
  const payload = genaratePayload(mobileNumber, { amount });
  const option = {
    color: {
      dark: '#000',
      light: '#fff'
    }
  }
  QRCode.toDataURL(payload, option, (err, url) => {
    if(err) {
      console.log('generate fail')
      return res.status(400).json({
        RespCode: 400,
        RespMessage: 'bad : ' + err
      })
    } else {
      const transRef = `014${mobileNumber}APP${generateRandomNumber(5)}`
      return res.status(200).json({
        RespCode: 200,
        RespMessage: 'good',
        Result: url,
        transRef: transRef
      })
    }
  })
})

app.post('/saveQR', async (req, res) => {
  const qrImageData = req.body.qrImageData; // Access the base64 data from the request body

  if (!qrImageData) {
      console.error('QR image data is missing');
      return res.status(400).json({
          RespCode: 400,
          RespMessage: 'QR image data is missing'
      });
  }

  try {
      // Remove the 'data:image/png;base64,' prefix
      const base64Data = qrImageData.replace(/^data:image\/png;base64,/, '');

      // Save the base64 data as an image file
      fs.writeFileSync('qr_image.png', base64Data, 'base64');

      console.log('QR image saved successfully');
      return res.status(200).json({
          RespCode: 200,
          RespMessage: 'QR image saved successfully'
      });
  } catch (err) {
      console.error('Failed to save QR image:', err);
      return res.status(500).json({
          RespCode: 500,
          RespMessage: 'Failed to save QR image'
      });
  }
});

function generateRandomNumber(length) {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.post('/expired-Payment', async (req, res) => {
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const delFailedAppointment = `
    DELETE FROM appointment
    WHERE LineUserID = ? AND AppointmentID = ?;
  `;

  try {
    const CurrentAppointmentID = await new Promise((resolve, reject) => {
      connection.query(
          'SELECT MAX(AppointmentID) AS maxAppointmentID FROM `appointment` WHERE `LineUserID` = ?', 
          [LineUserID], 
          (error, results) => {
              if (error) {
                  console.error('Error getting max AppointmentID:', error);
                  reject(error);
              } else {
                  const maxAppointmentID = results[0].maxAppointmentID;
                  resolve(maxAppointmentID);
              }
          }
      );
    });  
    console.log(CurrentAppointmentID);

    await query(delFailedAppointment, [LineUserID, CurrentAppointmentID]);

    res.status(200).send('Delete Appointment Successfully');

  } catch (error) {
    console.error('Error delete data:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = app;

app.post('/success-appoint', async (req, res) => {
  const authToken = req.headers['authorization']
  const token = authToken.substring(7, authToken.length);
  const decoded = jwt.verify(token, 'mysecret');
  LineUserID = decoded.sub;
  // LineUserID = "Uda15171e876e434f23c22eaa70925bc7";

  if (!LineUserID) {
    return res.status(400).send('LineUserID is required');
  }

  const FetchCurrentAppointment = `
    SELECT HospitalID, HospitalDate, hosSlotID, OffSiteDate, offSlotID
    FROM appointment
    WHERE LineUserID = ? AND AppointmentID = ?;
  `;

  const fetchHospital = `
    SELECT hos_name
    FROM Hospital
    WHERE HospitalID = ?;
  `;

  const fetchTimeSlotHospital = `
    SELECT HospitalDate, start_time, end_time
    FROM timeslothospital
    WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
  `;

  const fetchTimeSlotOffSite = `
    SELECT OffSiteDate, start_time, end_time
    FROM timeslotoffsite
    WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
  `;

  try {
    const CurrentAppointmentID = await new Promise((resolve, reject) => {
      connection.query(
          "SELECT MAX(AppointmentID) AS maxAppointmentID FROM `appointment` WHERE `LineUserID` = ?", 
          [LineUserID], 
          (error, results) => {
              if (error) {
                  console.error('Error getting max AppointmentID', error);
                  reject(error);
              } else if (results.length > 0){
                  var currentAppID = results[0].maxAppointmentID;
                  resolve(currentAppID);
              }
          }
      );
    });  

    const AppointInfo = await new Promise((resolve, reject) => {
      connection.query(FetchCurrentAppointment, 
      [LineUserID, CurrentAppointmentID], (error, results) => {
        if (error) {
          console.error('Error getting Appoint Info:', error);
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    let hospital = await query(fetchHospital, [AppointInfo[0].HospitalID]);

    function formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const hospitalDate = AppointInfo[0].HospitalDate ? formatDate(AppointInfo[0].HospitalDate) : null;
    const offSiteDate = AppointInfo[0].OffSiteDate ? formatDate(AppointInfo[0].OffSiteDate) : null;

    let timeslot;
    if (hospitalDate && AppointInfo[0].hosSlotID) {
      timeslot = await query(fetchTimeSlotHospital, [AppointInfo[0].HospitalID, hospitalDate, AppointInfo[0].hosSlotID]);
    }
    else if (offSiteDate && AppointInfo[0].offSlotID) {
      timeslot = await query(fetchTimeSlotOffSite, [AppointInfo[0].HospitalID, offSiteDate, AppointInfo[0].offSlotID]);
    }

    res.status(200).json({ hospital, timeslot });

  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Internal Server Error');
  }
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
      if(token === "null"){
        res.status(500).send('Token is not Found');
      }
      else{
        const isValid = validateAuth(token)
        if (isValid == true) {
          res.status(200).send({ message:'Token is Valid'});    
        } else {
            res.status(500).send('Token is not Valid');
        }  
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

        const decodedToken = jwt.decode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token is expired, clear localStorage
          res.status(401).send({ message: 'Token expired' });
        } else {
          // Token is valid, send it along with the response
          res.status(200).send({ message: 'Form data inserted successfully', token });
        }
      }
      else{
        res.status(500).send("No current Admin in database");
      }
    }
  });
});

// Get Admin's hospital name
app.get('/admin-get-hospital-name', async (req, res) => {
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
          const results = await queryAsync('SELECT hos_name FROM `hospital` WHERE `HospitalID` = ?', [HospitalID])
          res.status(200).send({ message: "Get Admin Hospital Name", results });
        }
        else {
          res.status(500).send("There are no hospital data");
        }
      }catch (error) {
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

// Get all users Appointment that admin is work on
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
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC', [HospitalID]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_name.push(result[0].first_name + ' ' + result[0].last_name);
                phone.push(result[0].phone);

                if (appointment.HospitalDate !== null) {
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                }
              }

              Appointment_Status.push(appointment.LabStatus);
              user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
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

// Get all users Appointment that admin is work on (Selected Date)
app.get('/admin-get-users-appointment-date/:date', async (req, res) => {
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
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC', [HospitalID]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                const reqYear = req.params.date.split('-')[0];
                const reqMonth = req.params.date.split('-')[1];
                const appointmentDate = results[0].HospitalDate || results[0].OffSiteDate;
                const appointmentYear = appointmentDate.split('-')[0];
                const appointmentMonth = appointmentDate.split('-')[1];

                if (appointment.HospitalDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
                
                } else if (appointment.OffSiteDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
                }
              }
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
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? AND `AppointmentID` = ?' , [HospitalID, Appointmentid]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {

              user_info.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_info.push(result[0].first_name + ' ' + result[0].last_name);
                user_info.push(result[0].phone);

                if (appointment.HospitalDate !== null) {
                  user_info.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  user_info.push(timeSlot[0].TimeSlot);
                  user_info.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  user_info.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  user_info.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  user_info.push(address[0].ad_line1);
                  user_info.push(address[0].ad_line2);
                  user_info.push(address[0].province);
                  user_info.push(address[0].city);
                  user_info.push(address[0].zipcode);
                }
              } 
              user_info.push(appointment.LabStatus);
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
              await queryAsync('UPDATE `appointment` SET `LabStatus` = ? WHERE `AppointmentID` = ?', [newStatuses.newStatus, newStatuses.AppointmentID]);
            }
          }
          console.log('Update Complete');
          res.status(200).send('Update Complete');
      } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
      }
    } else {
      console.error('Error');
      res.status(500).send('Token is not valid');
    }
  } else {
    console.error('Error:', error);
    res.status(500).send('Token is not found');
  }
});

// Get the Users' Appointment (status is waiting) that admin is work on (Not Select Date)
app.get('/admin-get-users-appointment-only-waiting', async (req, res) => {
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
          const LabStatus = "Waiting";
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? AND `LabStatus` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC', [HospitalID, LabStatus]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_name.push(result[0].first_name + ' ' + result[0].last_name);
                phone.push(result[0].phone);

                if (appointment.HospitalDate !== null) {
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                }
              }

              Appointment_Status.push(appointment.LabStatus);
              user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
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

// Get the Users' Appointment (status is waiting) that admin is work on (Selected Date)
app.get('/admin-get-users-appointment-only-waiting-date/:date', async (req, res) => {
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
          const LabStatus = "Waiting";
          const results = await queryAsync(`SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM \`appointment\` WHERE \`HospitalID\` = ? AND \`LabStatus\` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC`, [HospitalID, LabStatus]);

          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = [];
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                const reqYear = req.params.date.split('-')[0];
                const reqMonth = req.params.date.split('-')[1];
                const appointmentDate = results[0].HospitalDate || results[0].OffSiteDate;
                const appointmentYear = appointmentDate.split('-')[0];
                const appointmentMonth = appointmentDate.split('-')[1];

                if (appointment.HospitalDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });

                } else if (appointment.OffSiteDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
                }
              }
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
app.get('/admin-get-users-appointment-only-waiting/:id', async (req, res) => {
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
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate FROM `appointment` WHERE `HospitalID` = ? AND `AppointmentID` = ?' , [HospitalID, Appointmentid]);
          
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
              user_info.push(appointment.LabStatus);

              const hospital = await queryAsync('SELECT HospitalID, hos_name FROM `hospital` WHERE `HospitalID` = ?', [appointment.HospitalID]);
              if(hospital.length > 0){
                user_info.push(hospital[0].hos_name);
              }
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

// Admin Send the test report via email 
app.post('/admin-sendEmail', async (req, res) => {
  const { appt_id, to, subject, text, attachment } = req.body;

  // console.log('Received email data:', { to, subject, text, hasAttachment: attachment });

  if (!attachment) {
    return res.status(400).json({ message: 'Attachment not provided' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "test.fastappt@gmail.com",
      pass: "mdzs xjyr qzgj rgwk",
    },
  });

  const mailOptions = {
    from: 'test.fastappt@gmail.com',
    to: to,
    subject: subject,
    text: text,
  };

  try {
    // Decode Base64 attachment
    const base64Data = attachment.split("base64,")[1];
    const decodedAttachment = buffer.Buffer.from(base64Data, 'base64');
    // console.log(decodedAttachment);
    mailOptions.attachments = [
      {
        filename: "Test_Result_FastAppt.pdf",
        content: decodedAttachment,
        encoding: 'base64', 
      }
    ]

    // console.log('Sending email:', mailOptions);

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully')
    
    const authToken = req.headers['authorization'];
    if (authToken && authToken.startsWith('Bearer ')) {
      const token = authToken.substring(7, authToken.length);
      const isValid = validateAuth(token);
      if (isValid) {
          const decoded = jwt.verify(token, 'mysecret');
          const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

          if (admin.length > 0) {
            const newStatuses = "Received";
              const currentStatus = await queryAsync('SELECT * FROM `appointment` WHERE `AppointmentID` = ?', [appt_id]);

              if (currentStatus.length > 0) {
                // Update the status in the database
                await queryAsync('UPDATE `appointment` SET `LabStatus` = ? WHERE `AppointmentID` = ?', [newStatuses, appt_id]);
              }
          }
      }
    }
    res.status(200).json({ message: 'Email sent successfully and Update Appointment Status' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

// Get all selected date's Time slot of the hospital that admin works to
app.post('/admin-get-timeslothospital', async (req, res) => {
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
app.post('/admin-update-timeslothospital', async (req, res) => {
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

// Get all selected date's Time slot of the hospital offsite that admin works to
app.post('/admin-get-timeslotoffsite', async (req, res) => {
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
          const results = await queryAsync('SELECT offSlotID, amount, start_time, end_time FROM `timeslotoffsite` WHERE `OffSiteDate` = ? AND `HospitalID` = ?', [HospitalDate, HospitalID]);

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

// Update the selected date's Time slot of the hospital offsite that admin works to
app.post('/admin-update-timeslotoffsite', async (req, res) => {
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
          await queryAsync('UPDATE `timeslotoffsite` SET amount = ? WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?', [Amount, HospitalID, HospitalDate, hosSlotID]);

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

// Admin get all existing year of time slot hospital in the database
app.get('/admin-get-existing-years-timeslothospital', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;

    const year = await queryAsync('SELECT DISTINCT YEAR(`HospitalDate`) AS year FROM `timeslothospital` WHERE `HospitalID` = ?', [HospitalID]);
    if(year.length === 0){
      return res.status(404).send('Year Does not Exist');
    }else{
      res.status(200).send({ message: "Get All Year", year });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add new timeslot yealy of the hospital that admin works to
app.post('/admin-add-timeslothospital', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;
    const startYear = parseInt(req.body.selectedYear, 10);
    let start_date = new Date(startYear, 0, 1);
    let end_date = new Date(startYear, 11, 31);
    let hosSlotID = 1;
    const start_time = `${padZero(req.body.selectedStartTime)}:00:00`;
    const end_time = `${padZero(req.body.selectedEndTime)}:00:00`;
    const amount = parseInt(req.body.selectedAmount, 10);

    if (startYear && start_time && end_time && amount) {
      while (start_date <= end_date) {
        let current_start_time = '06:00:00';
        while (current_start_time < '18:00:00') {
          const current_end_time = addHours(current_start_time, 1);
          const current_amount = (current_start_time < start_time || current_start_time >= end_time) ? -1 : amount;
          await queryAsync(
            'INSERT IGNORE INTO `timeslothospital` (`HospitalID`, `HospitalDate`, `hosSlotID`, `start_time`, `end_time`, `amount`) VALUES (?, ?, ?, ?, ?, ?)',
            [HospitalID, formatDate(start_date), hosSlotID, current_start_time, current_end_time, current_amount]
          );

          hosSlotID++;
          current_start_time = addHours(current_start_time, 1);
        }
        hosSlotID = 1;
        start_date.setDate(start_date.getDate() + 1);
      }

      res.status(200).send({ message: 'New time slot added successfully' });
    } else {
      res.status(400).send({ message: 'Missing required fields' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin get all existing year of time slot offsite in the database
app.get('/admin-get-existing-years-timeslotoffsite', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;

    const year = await queryAsync('SELECT DISTINCT YEAR(`OffsiteDate`) AS year FROM `timeslotoffsite` WHERE `HospitalID` = ?', [HospitalID]);
    if(year.length === 0){
      return res.status(404).send('Year Does not Exist');
    }else{
      res.status(200).send({ message: "Get All Year", year });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add new timeslot yealy of the hospital that admin works to
app.post('/admin-add-timeslotoffsite', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;
    const startYear = parseInt(req.body.selectedYear, 10);
    let start_date = new Date(startYear, 0, 1);
    let end_date = new Date(startYear, 11, 31);
    let hosSlotID = 1;
    const start_time = `${padZero(req.body.selectedStartTime)}:00:00`;
    const end_time = `${padZero(req.body.selectedEndTime)}:00:00`;
    const amount = parseInt(req.body.selectedAmount, 10);

    if (startYear && start_time && end_time && amount) {
      while (start_date <= end_date) {
        let current_start_time = '06:00:00';
        while (current_start_time < '18:00:00') {
          const current_end_time = addHours(current_start_time, 1);
          const current_amount = (current_start_time < start_time || current_start_time >= end_time) ? -1 : amount;
          await queryAsync(
            'INSERT IGNORE INTO `timeslotoffsite` (`HospitalID`, `OffSiteDate`, `offSlotID`, `start_time`, `end_time`, `amount`) VALUES (?, ?, ?, ?, ?, ?)',
            [HospitalID, formatDate(start_date), hosSlotID, current_start_time, current_end_time, current_amount]
          );

          hosSlotID++;
          current_start_time = addHours(current_start_time, 1);
        }
        hosSlotID = 1;
        start_date.setDate(start_date.getDate() + 1);
      }

      res.status(200).send({ message: 'New time slot added successfully' });
    } else {
      res.status(400).send({ message: 'Missing required fields' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

function addHours(timeString, hoursToAdd) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date(0, 0, 0, hours, minutes, seconds);
  date.setHours(date.getHours() + hoursToAdd);
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

function padZero(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}-${month}-${day}`;
}

// Get the test specimen
app.post('/admin-test-specimen', async (req, res) => {
  const authToken = req.headers['authorization'];
  const {AppointmentID} = req.body;
  console.log(AppointmentID);
  const fetchOrderDetails = `
    SELECT a.OrderID, o_number, PackageID, DiseaseID, TestID, specimen, transfer, RefNum
    FROM appointment a INNER JOIN OrdersDetails od ON a.OrderID = od.OrderID
    WHERE AppointmentID = ? AND HospitalID = ?;
  `;
  const fetchOrdersPackage = `
    SELECT od.PackageID, th_package_name, en_package_name
    FROM OrdersDetails od INNER JOIN Package P ON od.PackageID = P.PackageID
    WHERE OrderID IN (?);
  `;
  const fetchOrdersDisease = `
    SELECT od.DiseaseID, th_name, en_name
    FROM OrdersDetails od INNER JOIN Disease d ON od.DiseaseID = d.DiseaseID
    WHERE OrderID IN (?);
  `;
  const fetchOrdersLabTest = `
    SELECT od.TestID, th_name, en_name
    FROM OrdersDetails od INNER JOIN LabTest T ON od.TestID = T.TestID
    WHERE OrderID IN (?);
  `;
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        if (admin.length > 0) {
          const HospitalID = admin[0].HospitalID;
          
          let test = await queryAsync(fetchOrderDetails, [AppointmentID, HospitalID]);
          const OrderIDs = test.map(item => item.OrderID);
          const [PackageOrders, DiseaseOrders, LabTestOrders] = await Promise.all([
            queryAsync(fetchOrdersPackage, [OrderIDs]),
            queryAsync(fetchOrdersDisease, [OrderIDs]),
            queryAsync(fetchOrdersLabTest, [OrderIDs])
          ]);
          res.status(200).send({ message: "Get All Tests", test, PackageOrders, DiseaseOrders, LabTestOrders });
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
// Update Transportation
app.put('/update-test-transportation', async (req, res) => {
  const authToken = req.headers['authorization'];
  const { AppointmentID, newTransportation, PackageID, DiseaseID, TestID } = req.body;
  console.log(newTransportation[0]);
  const fetchOrderDetails = `
    SELECT a.OrderID
    FROM appointment a INNER JOIN OrdersDetails od ON a.OrderID = od.OrderID
    WHERE AppointmentID = ? AND HospitalID = ?;
  `;
  const UpdatePackageOrderDetails = `
    UPDATE ordersdetails
    SET transfer = ?
    WHERE OrderID = ? AND PackageID = ?;
  `;
  const UpdateDiseaseOrderDetails = `
    UPDATE ordersdetails
    SET transfer = ?
    WHERE OrderID = ? AND DiseaseID = ?;
  `;
  const UpdateTestOrderDetails = `
    UPDATE ordersdetails
    SET transfer = ?
    WHERE OrderID = ? AND TestID = ?;
  `;
  const InsertTransportation = `
    INSERT INTO transportation (RefNum)
    VALUE (?);
  `;
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        if (admin.length > 0) {
          const HospitalID = admin[0].HospitalID;
          
          let test = await queryAsync(fetchOrderDetails, [AppointmentID, HospitalID]);
          console.log("test: ", test);
          // const OrderIDs = test.map(item => item.OrderID);
          // queryAsync(InsertTransportation, [newRefNum]);
          await Promise.all([
            queryAsync(UpdatePackageOrderDetails, [newTransportation[0], test[0].OrderID, PackageID]),
            queryAsync(UpdateDiseaseOrderDetails, [newTransportation[0], test[0].OrderID, DiseaseID]),
            queryAsync(UpdateTestOrderDetails, [newTransportation[0], test[0].OrderID, TestID])
          ]);
          // console.log("Lab: ", LabTestOrders);
          res.status(200).send({ message: "Update Tests"});
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
      if(token === "null"){
        res.status(500).send('Token is not Found');
      }
      else{
        const isValid = validateSuperAuth(token)
        if (isValid == true) {
          res.status(200).send({ message:'Token is Valid'});    
        } else {
            res.status(500).send('Token is not Valid');
        }
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

        const decodedToken = jwt.decode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          // Token is expired, clear localStorage
          res.status(401).send({ message: 'Token expired' });
        } else {
          // Token is valid, send it along with the response
          res.status(200).send({ message: 'Form data inserted successfully', token });
        }
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

// Get All Users' Appointment that Super admin work on
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
          const HospitalID = admin[0].HospitalID;
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC', [HospitalID]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = [];
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_name.push(result[0].first_name + ' ' + result[0].last_name);
                phone.push(result[0].phone);

                if (appointment.HospitalDate !== null) {
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                }
              }

              Appointment_Status.push(appointment.LabStatus);
              user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
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

// Get All Users' Appointment that Super admin work on (Selected Date)
app.get('/super-admin-get-users-appointment-date/:date', async (req, res) => {
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
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC', [HospitalID]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                const reqYear = req.params.date.split('-')[0];
                const reqMonth = req.params.date.split('-')[1];
                const appointmentDate = results[0].HospitalDate || results[0].OffSiteDate;
                const appointmentYear = appointmentDate.split('-')[0];
                const appointmentMonth = appointmentDate.split('-')[1];

                if (appointment.HospitalDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });

                } else if (appointment.OffSiteDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
                }
              }
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

// Get the Selected Users' Appointment that Super admin is work on
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
          const HospitalID = admin[0].HospitalID;
          const Appointmentid = req.params.id;
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? AND `AppointmentID` = ?' , [HospitalID, Appointmentid]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {

              user_info.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_info.push(result[0].first_name + ' ' + result[0].last_name);
                user_info.push(result[0].phone);

                if (appointment.HospitalDate !== null) {
                  user_info.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  user_info.push(timeSlot[0].TimeSlot);
                  user_info.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  user_info.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  user_info.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  user_info.push(address[0].ad_line1);
                  user_info.push(address[0].ad_line2);
                  user_info.push(address[0].province);
                  user_info.push(address[0].city);
                  user_info.push(address[0].zipcode);
                }
              } 
              user_info.push(appointment.LabStatus);
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
              await queryAsync('UPDATE `appointment` SET `LabStatus` = ? WHERE `AppointmentID` = ?', [newStatuses.newStatus, newStatuses.AppointmentID]);
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

// Get the Users' Appointment (status is received) that Super admin is work on
app.get('/super-admin-get-users-appointment-only-waiting', async (req, res) => {
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
          const LabStatus = "Waiting";
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM `appointment` WHERE `HospitalID` = ? AND `LabStatus` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC', [HospitalID, LabStatus]);
          
          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                user_name.push(result[0].first_name + ' ' + result[0].last_name);
                phone.push(result[0].phone);

                if (appointment.HospitalDate !== null) {
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                } else if (appointment.OffSiteDate !== null) {
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                }
              }

              Appointment_Status.push(appointment.LabStatus);
              user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
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

// Get the Users' Appointment (status is waiting) that Super admin is work on (Selected Date)
app.get('/super-admin-get-users-appointment-only-waiting-date/:date', async (req, res) => {
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
          const LabStatus = "Waiting";
          const results = await queryAsync(`SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, hosSlotID, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, offSlotID FROM \`appointment\` WHERE \`HospitalID\` = ? AND \`LabStatus\` = ? ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC`, [HospitalID, LabStatus]);

          const fetchTimeSlotHospital = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslothospital
            WHERE HospitalID = ? AND HospitalDate = ? AND hosSlotID = ?;
          `;
          const fetchTimeSlotOffSite = `
            SELECT CONCAT(DATE_FORMAT(start_time, '%H:%i'), '-', DATE_FORMAT(end_time, '%H:%i')) AS TimeSlot
            FROM timeslotoffsite
            WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?;
          `;

          if (results.length > 0) {
            const user_info = [];

            for (const appointment of results) {
              const AppointmentID = []
              const user_name = [];
              const phone = [];
              const Date = [];
              const Time = [];
              const Address = [];
              const Appointment_Status = [];

              AppointmentID.push(appointment.AppointmentID);

              const result = await queryAsync('SELECT InfoID, email, first_name, last_name, DATE_FORMAT(birthday, "%Y-%m-%d") AS birthday, sex, phone, weight, height, allergic, congenital_disease, AddressID FROM userinfo WHERE `InfoID` = ?', [appointment.InfoID]);
              
              if (result.length > 0) {
                const reqYear = req.params.date.split('-')[0];
                const reqMonth = req.params.date.split('-')[1];
                const appointmentDate = results[0].HospitalDate || results[0].OffSiteDate;
                const appointmentYear = appointmentDate.split('-')[0];
                const appointmentMonth = appointmentDate.split('-')[1];

                if (appointment.HospitalDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.HospitalDate);
                  timeSlot = await query(fetchTimeSlotHospital, [appointment.HospitalID, appointment.HospitalDate, appointment.hosSlotID]);
                  Time.push(timeSlot[0].TimeSlot);
                  Address.push('None');
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });

                } else if (appointment.OffSiteDate !== null && appointmentYear === reqYear && appointmentMonth === reqMonth) {
                  user_name.push(result[0].first_name + ' ' + result[0].last_name);
                  phone.push(result[0].phone);
                  Date.push(appointment.OffSiteDate);
                  timeSlot = await query(fetchTimeSlotOffSite, [appointment.HospitalID, appointment.OffSiteDate, appointment.offSlotID]);
                  Time.push(timeSlot[0].TimeSlot);

                  const address = await queryAsync('SELECT * FROM `useraddress` WHERE `AddressID` = ?', [result[0].AddressID]);
                  Address.push(address[0].ad_line1);
                  Address.push(address[0].ad_line2);
                  Address.push(address[0].province);
                  Address.push(address[0].city);
                  Address.push(address[0].zipcode);
                  Appointment_Status.push(appointment.LabStatus);
                  user_info.push({ AppointmentID, user_name, phone, Date, Time, Address, Appointment_Status });
                }
              }
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

// Get the Selected Users' Appointment (email) that Super admin is work on
app.get('/super-admin-get-users-appointment-only-waiting/:id', async (req, res) => {
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
          const Appointmentid = req.params.id;
          const results = await queryAsync('SELECT AppointmentID, DATE_FORMAT(Book_datetime, "%Y-%m-%d") AS Book_datetime, LabStatus, InfoID, OrderID, HospitalID, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate FROM `appointment` WHERE `HospitalID` = ? AND `AppointmentID` = ?' , [HospitalID, Appointmentid]);
          
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
              user_info.push(appointment.LabStatus);

              const hospital = await queryAsync('SELECT HospitalID, hos_name FROM `hospital` WHERE `HospitalID` = ?', [appointment.HospitalID]);
              if(hospital.length > 0){
                user_info.push(hospital[0].hos_name);
              }
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

// Super Admin Send the test report via email 
app.post('/super-admin-sendEmail', async (req, res) => {
  const { appt_id, to, subject, text, attachment } = req.body;

  // console.log('Received email data:', { to, subject, text, hasAttachment: attachment });

  if (!attachment) {
    return res.status(400).json({ message: 'Attachment not provided' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: "test.fastappt@gmail.com",
      pass: "mdzs xjyr qzgj rgwk",
    },
  });

  const mailOptions = {
    from: 'test.fastappt@gmail.com',
    to: to,
    subject: subject,
    text: text,
  };

  try {
    // Decode Base64 attachment
    const base64Data = attachment.split("base64,")[1];
    const decodedAttachment = buffer.Buffer.from(base64Data, 'base64');
    // console.log(decodedAttachment);
    mailOptions.attachments = [
      {
        filename: "Test_Result_FastAppt.pdf",
        content: decodedAttachment,
        encoding: 'base64', 
      }
    ]

    // console.log('Sending email:', mailOptions);

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully')
    
    const authToken = req.headers['authorization'];
    if (authToken && authToken.startsWith('Bearer ')) {
      const token = authToken.substring(7, authToken.length);
      const isValid = validateSuperAuth(token);
      if (isValid) {
          const decoded = jwt.verify(token, 'mysecret');
          const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);

          if (admin.length > 0) {
            const newStatuses = "Received";
              const currentStatus = await queryAsync('SELECT * FROM `appointment` WHERE `AppointmentID` = ?', [appt_id]);

              if (currentStatus.length > 0) {
                // Update the status in the database
                await queryAsync('UPDATE `appointment` SET `LabStatus` = ? WHERE `AppointmentID` = ?', [newStatuses, appt_id]);
              }
          }
      }
    }
    res.status(200).json({ message: 'Email sent successfully and Update Appointment Status' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

// Get all selected date's Time slot of the hospital that Super admin works to
app.post('/super-admin-get-timeslothospital', async (req, res) => {
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

// Update the selected date's Time slot of the hospital that Super admin works to
app.post('/super-admin-update-timeslothospital', async (req, res) => {
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

// Get all selected date's Time slot of the hospital offsite that Super admin works to
app.post('/super-admin-get-timeslotoffsite', async (req, res) => {
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
          const results = await queryAsync('SELECT offSlotID, amount, start_time, end_time FROM `timeslotoffsite` WHERE `OffSiteDate` = ? AND `HospitalID` = ?', [HospitalDate, HospitalID]);

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

// Update the selected date's Time slot of the hospital offsite that Super admin works to
app.post('/super-admin-update-timeslotoffsite', async (req, res) => {
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
          await queryAsync('UPDATE `timeslotoffsite` SET amount = ? WHERE HospitalID = ? AND OffSiteDate = ? AND offSlotID = ?', [Amount, HospitalID, HospitalDate, hosSlotID]);

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

// Admin get all existing year of time slot hospital in the database
app.get('/super-admin-get-existing-years-timeslothospital', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateSuperAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;

    const year = await queryAsync('SELECT DISTINCT YEAR(`HospitalDate`) AS year FROM `timeslothospital` WHERE `HospitalID` = ?', [HospitalID]);
    if(year.length === 0){
      return res.status(404).send('Year Does not Exist');
    }else{
      res.status(200).send({ message: "Get All Year", year });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add new timeslot yealy of the hospital that admin works to
app.post('/super-admin-add-timeslothospital', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateSuperAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;
    const startYear = parseInt(req.body.selectedYear, 10);
    let start_date = new Date(startYear, 0, 1);
    let end_date = new Date(startYear, 11, 31);
    let hosSlotID = 1;
    const start_time = `${padZero(req.body.selectedStartTime)}:00:00`;
    const end_time = `${padZero(req.body.selectedEndTime)}:00:00`;
    const amount = parseInt(req.body.selectedAmount, 10);

    if (startYear && start_time && end_time && amount) {
      while (start_date <= end_date) {
        let current_start_time = '06:00:00';
        while (current_start_time < '18:00:00') {
          const current_end_time = addHours(current_start_time, 1);
          const current_amount = (current_start_time < start_time || current_start_time >= end_time) ? -1 : amount;
          await queryAsync(
            'INSERT IGNORE INTO `timeslothospital` (`HospitalID`, `HospitalDate`, `hosSlotID`, `start_time`, `end_time`, `amount`) VALUES (?, ?, ?, ?, ?, ?)',
            [HospitalID, formatDate(start_date), hosSlotID, current_start_time, current_end_time, current_amount]
          );

          hosSlotID++;
          current_start_time = addHours(current_start_time, 1);
        }
        hosSlotID = 1;
        start_date.setDate(start_date.getDate() + 1);
      }

      res.status(200).send({ message: 'New time slot added successfully' });
    } else {
      res.status(400).send({ message: 'Missing required fields' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Admin get all existing year of time slot offsite in the database
app.get('/super-admin-get-existing-years-timeslotoffsite', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateSuperAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;

    const year = await queryAsync('SELECT DISTINCT YEAR(`OffsiteDate`) AS year FROM `timeslotoffsite` WHERE `HospitalID` = ?', [HospitalID]);
    if(year.length === 0){
      return res.status(404).send('Year Does not Exist');
    }else{
      res.status(200).send({ message: "Get All Year", year });
    }
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Add new timeslot yealy of the hospital that admin works to
app.post('/super-admin-add-timeslotoffsite', async (req, res) => {
  try {
    const authToken = req.headers['authorization'];
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).send('Token is not found');
    }

    const token = authToken.substring(7);
    const isValid = validateSuperAuth(token);
    if (!isValid) {
      return res.status(401).send('Token is not valid');
    }

    const decoded = jwt.verify(token, 'mysecret');
    const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
    if (admin.length === 0) {
      return res.status(404).send('Admin not found');
    }

    const HospitalID = admin[0].HospitalID;
    const startYear = parseInt(req.body.selectedYear, 10);
    let start_date = new Date(startYear, 0, 1);
    let end_date = new Date(startYear, 11, 31);
    let hosSlotID = 1;
    const start_time = `${padZero(req.body.selectedStartTime)}:00:00`;
    const end_time = `${padZero(req.body.selectedEndTime)}:00:00`;
    const amount = parseInt(req.body.selectedAmount, 10);

    if (startYear && start_time && end_time && amount) {
      while (start_date <= end_date) {
        let current_start_time = '06:00:00';
        while (current_start_time < '18:00:00') {
          const current_end_time = addHours(current_start_time, 1);
          const current_amount = (current_start_time < start_time || current_start_time >= end_time) ? -1 : amount;
          await queryAsync(
            'INSERT IGNORE INTO `timeslotoffsite` (`HospitalID`, `OffSiteDate`, `offSlotID`, `start_time`, `end_time`, `amount`) VALUES (?, ?, ?, ?, ?, ?)',
            [HospitalID, formatDate(start_date), hosSlotID, current_start_time, current_end_time, current_amount]
          );

          hosSlotID++;
          current_start_time = addHours(current_start_time, 1);
        }
        hosSlotID = 1;
        start_date.setDate(start_date.getDate() + 1);
      }

      res.status(200).send({ message: 'New time slot added successfully' });
    } else {
      res.status(400).send({ message: 'Missing required fields' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

function addHours(timeString, hoursToAdd) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const date = new Date(0, 0, 0, hours, minutes, seconds);
  date.setHours(date.getHours() + hoursToAdd);
  return `${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

function padZero(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = padZero(date.getMonth() + 1);
  const day = padZero(date.getDate());
  return `${year}-${month}-${day}`;
}

// Get the test specimen
app.post('/super-admin-test-specimen', async (req, res) => {
  const authToken = req.headers['authorization'];
  const {AppointmentID} = req.body;
  console.log(AppointmentID);
  const fetchOrderDetails = `
    SELECT a.OrderID, o_number, PackageID, DiseaseID, TestID, specimen, transfer, RefNum
    FROM appointment a INNER JOIN OrdersDetails od ON a.OrderID = od.OrderID
    WHERE AppointmentID = ? AND HospitalID = ?;
  `;
  const fetchOrdersPackage = `
    SELECT od.PackageID, th_package_name, en_package_name
    FROM OrdersDetails od INNER JOIN Package P ON od.PackageID = P.PackageID
    WHERE OrderID IN (?);
  `;
  const fetchOrdersDisease = `
    SELECT od.DiseaseID, th_name, en_name
    FROM OrdersDetails od INNER JOIN Disease d ON od.DiseaseID = d.DiseaseID
    WHERE OrderID IN (?);
  `;
  const fetchOrdersLabTest = `
    SELECT od.TestID, th_name, en_name
    FROM OrdersDetails od INNER JOIN LabTest T ON od.TestID = T.TestID
    WHERE OrderID IN (?);
  `;
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        if (admin.length > 0) {
          const HospitalID = admin[0].HospitalID;
          
          let test = await queryAsync(fetchOrderDetails, [AppointmentID, HospitalID]);
          const OrderIDs = test.map(item => item.OrderID);
          const [PackageOrders, DiseaseOrders, LabTestOrders] = await Promise.all([
            queryAsync(fetchOrdersPackage, [OrderIDs]),
            queryAsync(fetchOrdersDisease, [OrderIDs]),
            queryAsync(fetchOrdersLabTest, [OrderIDs])
          ]);
          res.status(200).send({ message: "Get All Tests", test, PackageOrders, DiseaseOrders, LabTestOrders });
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

// Update Transportation
app.put('/update-test-transportation', async (req, res) => {
  const authToken = req.headers['authorization'];
  const { AppointmentID, newTransportation, PackageID, DiseaseID, TestID } = req.body;
  const filternewTransportation = newTransportation.filter(value => value === '1' || value === '0');
  const fetchOrderDetails = `
    SELECT a.OrderID
    FROM appointment a INNER JOIN OrdersDetails od ON a.OrderID = od.OrderID
    WHERE AppointmentID = ? AND HospitalID = ?;
  `;
  const UpdatePackageOrderDetails = `
    UPDATE ordersdetails
    SET transfer = ?
    WHERE OrderID = ? AND PackageID = ?;
  `;
  const UpdateDiseaseOrderDetails = `
    UPDATE ordersdetails
    SET transfer = ?
    WHERE OrderID = ? AND DiseaseID = ?;
  `;
  const UpdateTestOrderDetails = `
    UPDATE ordersdetails
    SET transfer = ?
    WHERE OrderID = ? AND TestID = ?;
  `;
  const InsertTransportation = `
    INSERT INTO transportation (RefNum)
    VALUE (?);
  `;
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        if (admin.length > 0) {
          const HospitalID = admin[0].HospitalID;
          
          let test = await queryAsync(fetchOrderDetails, [AppointmentID, HospitalID]);
          console.log("test: ", test);
          // const OrderIDs = test.map(item => item.OrderID);
          // queryAsync(InsertTransportation, [newRefNum]);
          await Promise.all([
            queryAsync(UpdatePackageOrderDetails, [filternewTransportation[0], test[0].OrderID, PackageID]),
            queryAsync(UpdateDiseaseOrderDetails, [filternewTransportation[0], test[0].OrderID, DiseaseID]),
            queryAsync(UpdateTestOrderDetails, [filternewTransportation[0], test[0].OrderID, TestID])
          ]);
          // console.log("Lab: ", LabTestOrders);
          res.status(200).send({ message: "Update Tests"});
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

// Get All Users' Appointment that are transported by other hospital
app.get('/super-admin-get-users-appointment-transported', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      const fetchReceiveSpecimenAppointment = `
        SELECT AppointmentID, a.InfoID, CONCAT(first_name, ' ', last_name) AS user_name, hos_name, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, LabStatus, OrderID
        FROM Appointment a INNER JOIN UserInfo u ON a.InfoID = u.InfoID
        INNER JOIN hospital h ON a.HospitalID = h.HospitalID
        WHERE OrderID IN (
          SELECT OrderID FROM OrdersDetails WHERE transfer = 1 ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC
        );
      `;
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        if (admin.length > 0) {
          let test = await queryAsync(fetchReceiveSpecimenAppointment);
          res.status(200).send({ message: "Get all transported appointment", test});
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

// Get All Users' Appointment that are transported by other hospital
app.get('/super-admin-get-users-appointment-transported-date/:date', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      const fetchReceiveSpecimenAppointment = `
        SELECT AppointmentID, a.InfoID, CONCAT(first_name, ' ', last_name) AS user_name, hos_name, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, LabStatus, OrderID
        FROM Appointment a INNER JOIN UserInfo u ON a.InfoID = u.InfoID
        INNER JOIN hospital h ON a.HospitalID = h.HospitalID
        WHERE OrderID IN (
          SELECT OrderID FROM OrdersDetails WHERE transfer = 1
        )
        AND (MONTH(HospitalDate) = ? AND YEAR(HospitalDate) = ?) OR (MONTH(OffSiteDate) = ? AND YEAR(OffSiteDate) = ?)
        ORDER BY COALESCE(HospitalDate, OffSiteDate) ASC
      `;
      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        if (admin.length > 0) {
          const reqYear = req.params.date.split('-')[0];
          const reqMonth = req.params.date.split('-')[1];
          let test = await queryAsync(fetchReceiveSpecimenAppointment, [reqMonth, reqYear, reqMonth, reqYear]);
          res.status(200).send({ message: "Get all transported appointment", test});
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

// Get All Users' Appointment that are transported by other hospital
app.get('/super-admin-get-users-appointment-transported/:id', async (req, res) => {
  const authToken = req.headers['authorization'];
  if (authToken && authToken.startsWith('Bearer ')) {
    const token = authToken.substring(7, authToken.length);
    const isValid = validateSuperAuth(token);
    if (isValid) {
      const fetchReceiveSpecimenAppointment = `
        SELECT AppointmentID, a.InfoID, CONCAT(first_name, ' ', last_name) AS user_name, hos_name, DATE_FORMAT(HospitalDate, "%Y-%m-%d") AS HospitalDate, DATE_FORMAT(OffSiteDate, "%Y-%m-%d") AS OffSiteDate, LabStatus, OrderID
        FROM Appointment a INNER JOIN UserInfo u ON a.InfoID = u.InfoID
        INNER JOIN hospital h ON a.HospitalID = h.HospitalID
        WHERE OrderID IN (
          SELECT OrderID FROM OrdersDetails WHERE transfer = 1
        )
        AND (AppointmentID = ?)
      `;
      const fetchOrdersPackage = `
        SELECT od.PackageID, th_package_name, en_package_name
        FROM OrdersDetails od INNER JOIN Package P ON od.PackageID = P.PackageID
        WHERE OrderID IN (?) AND transfer = 1;
      `;

      const fetchOrdersDisease = `
        SELECT od.DiseaseID, th_name, en_name
        FROM OrdersDetails od INNER JOIN Disease d ON od.DiseaseID = d.DiseaseID
        WHERE OrderID IN (?) AND transfer = 1;
      `;

      const fetchOrdersLabTest = `
        SELECT od.TestID, th_name, en_name
        FROM OrdersDetails od INNER JOIN LabTest T ON od.TestID = T.TestID
        WHERE OrderID IN (?) AND transfer = 1;
      `;

      try {
        const decoded = jwt.verify(token, 'mysecret');
        const admin = await queryAsync('SELECT * FROM `adminaccount` WHERE `AdminID` = ?', [decoded.sub]);
        if (admin.length > 0) {   
          let test = await queryAsync(fetchReceiveSpecimenAppointment, req.params.id);
          const OrderIDs = test.map(item => item.OrderID);
          const [PackageOrders, DiseaseOrders, LabTestOrders] = await Promise.all([
            queryAsync(fetchOrdersPackage, [OrderIDs]),
            queryAsync(fetchOrdersDisease, [OrderIDs]),
            queryAsync(fetchOrdersLabTest, [OrderIDs])
          ]);
          res.status(200).send({ message: "Get all transported appointment", test, PackageOrders, DiseaseOrders, LabTestOrders});
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