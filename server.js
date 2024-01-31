var express = require('express')
var cors = require('cors')
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  // password: 'ohm0817742474',
  database: 'mydb'
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
  // edit to receive line user id
  const decoded = jwt.verify(token, 'mysecret');
  lineuserId = decoded.sub
  // lineUserId = "Uda15171e876e434f23c22eaa70925bc7";

  // if (!lineUserId) {
  //   return res.status(400).send('LineUserID is required');
  // }

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

  // edit to receive line user id
  lineUserId = "Uda15171e876e434f23c22eaa70925bc7";

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