var express = require('express')
var cors = require('cors')
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ohm0817742474',
  database: 'healthcheckupplatform'
});

var app = express();

app.use(cors());
app.use(express.json());

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000')
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
        res.status(200).send('Form data inserted successfully');
    }
  });
});

app.post('/store-line-login-data', function (req, res, next) {
  const { lineUserId, displayName } = req.body;

  console.log('Received Line Login data:', { lineUserId, displayName });

  connection.query(
    'SELECT * FROM `lineaccount` WHERE `LineUserID` = ?',
    [lineUserId],
    (error, results) => {
      if (error) {
        console.error('Error checking existing data:', error);
        res.status(500).send('Internal Server Error');
      } else {
        if (results.length > 0) {
          // User already exists, do nothing
          console.log('User already exists in the database');
          res.status(200).json({ message: 'User already exists in the database' });
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
