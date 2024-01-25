const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'mydb'
});

router.post('/store-line-login-data', async (req, res) => {
  try {
    const { lineUserId, displayName } = req.body;

    console.log('Received Line Login data:', {lineUserId, displayName});

    // Your database insertion logic here
    connection.query(
        'INSERT INTO `lineaccount` (`LineUserID`, `displayName`) VALUES (?, ?)', 
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
  } catch (error) {
    console.error('Error updating Line Login data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.use('/api', router); // Adapt to your serverless function path

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
module.exports.handler = serverless(app);
