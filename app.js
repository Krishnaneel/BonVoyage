const express = require('express');
const app = express();
const port = 80; // Choosing a port for the server
const fs = require('fs');
require("dotenv").config()

const apiKey = process.env.GOOGLE_MAP_API_KEY;


console.log(__dirname);

// Serving static files from the 'assets' directory
app.use(express.static('assets'));

// Defining your routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/navigation', (req, res) => {
  // Reading the HTML file
  const filePath = `${__dirname}/navigation.html`;

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error in reading the HTML file');
    }

    // Replacing a placeholder in the HTML with the API key
    const htmlWithAPIKey = data.replace('API_KEY_PLACEHOLDER', apiKey);

    // console.log(apiKey)
    // console.log('htmlWithAPIKey:', htmlWithAPIKey);

    // Sending the modified HTML as the response
    res.send(htmlWithAPIKey);
  });
});

// Starting the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
