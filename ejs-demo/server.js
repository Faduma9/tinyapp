const express = require('express');
const app = express();
const path = require('path'); // Import the path module
const PORT = 8080;

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Define routes

// Index page
app.get('/', function(req, res) {
  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  var tagline = "No programming concept is complete without a cute animal mascot.";

  res.render('index', {
    mascots: mascots,
    tagline: tagline
  });
});

// About page
app.get('/about', function(req, res) {
  res.render('about');
});

// Start the server
app.listen(PORT, function() {
  console.log(`Server is listening on port ${PORT}`);
});
