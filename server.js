var express = require('express')
var cors = require('cors')
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'mydb'
});

var app = express();

app.use(cors());
app.use(express.json());

app.listen(5000, function () {
  console.log('CORS-enabled web server listening on port 5000')
});

app.post('/submit-form', function (req, res, next) {
  const { id, email, fname, lname, phone, BD, sex, weight, height, allergy, disease } = req.body;

  connection.query('INSERT INTO `userinfo` (`InfoID`, `email`, `first_name`, `last_name`, `birthday`, `sex`, `phone`, `weight`, `height`, `allergic`, `congenital_disease`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  [id, email, fname, lname, BD, sex, phone, weight, height, allergy, disease], (error, results) => {
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
    'INSERT INTO `lineaccount` (`LineUserID`, `displayName`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `DisplayName` = VALUES(`DisplayName`)', 
    [lineUserId, displayName], 
    (error, results) => {
      if (error) {
        console.error('Error updating Line Login data:', error);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Line Login data stored successfully');
        res.status(200).json({ message: 'Line Login data stored successfully' });
      }
    }
  );
});

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// connection.query(
//   'INSERT INTO `lineaccount`(`LineUserID`, `displayName`) VALUES (?, ?)',
//   [req.body.LineUserID, req.body.displayName],
//   function(err, results) {
//     res.json(results);
//   }
// );

// app.get('/users', function (req, res, next) {
//     connection.query(
//       'SELECT * FROM `userinfo`',
//       function(err, results, fields) {
//         res.json(results);
//       }
//     );
//   })
  
// app.get('/users/:id', function (req, res, next) {
//     const InfoID = req.params.id;
//     connection.query(
//         'SELECT * FROM `userinfo` WHERE `InfoID` = ?',
//         [InfoID],
//         function(err, results) {
//           res.json(results);
//         }
//     );
// })

// // Insert
// app.post('/users', function (req, res, next) {
//   connection.query(
//       'INSERT INTO `userinfo`(`InfoID`, `email`, `first_name`, `last_name`, `birthday`, `sex`, `phone`, `weight`, `height`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
//       [req.body.InfoID, req.body.email, req.body.first_name, req.body.last_name, req.body.birthday, req.body.sex, req.body.phone, req.body.weight, req.body.height],
//       function(err, results) {
//         res.json(results);
//       }
//   );
// })

// // Update
// app.put('/users', function (req, res, next) {
//   connection.query(
//       'UPDATE `userinfo` SET `birthday` = ?, `sex` = ? WHERE `InfoID` = ?',
//       [req.body.birthday, req.body.sex, req.body.InfoID],
//       function(err, results) {
//         res.json(results);
//       }
//   );
// })

// // Delete
// app.delete('/users', function (req, res, next) {
//   connection.query(
//       'DELETE FROM `userinfo` WHERE `InfoID` = ?',
//       [req.body.InfoID],
//       function(err, results) {
//         res.json(results);
//       }
//   );
// })