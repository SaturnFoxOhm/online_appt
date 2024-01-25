const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
//   password: 'your-database-password',
  database: 'mydb',
});

module.exports = async (req, res) => {
  // Handle the POST request data
  const { lineUserId, displayName } = req.body; // Assuming data is sent in the request body

  // Connect to the database
  connection.connect();

  // Insert data into the database
  connection.query('INSERT INTO `lineaccount` (`LineUserID`, `displayName`) VALUES (?, ?)',
  [lineUserId, displayName], 
  (error, results, fields) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      console.log(`Data inserted with ID: ${results.insertId}`);
      res.status(200).json({ message: 'Data stored successfully' });
    }
  });

  // Close the database connection
  connection.end();
};
