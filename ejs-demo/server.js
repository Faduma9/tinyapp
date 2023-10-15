var express = require('express');
var app = express();
var path = require('path'); // Import the path module

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Define routes

// Index page
app.get('/', function(req, res) {
  res.render('pages/index');

  var mascots = [
    { name: 'Sammy', organization: "DigitalOcean", birth_year: 2012},
    { name: 'Tux', organization: "Linux", birth_year: 1996},
    { name: 'Moby Dock', organization: "Docker", birth_year: 2013}
  ];
  var tagline = "No programming concept is complete without a cute animal mascot.";

  res.render('pages/index', {
    mascots: mascots,
    tagline: tagline
  });
});

// About page
app.get('/about', function(req, res) {
  res.render('pages/about');
});

// Start the server
app.listen(8080, function() {
  console.log('Server is listening on port 8080');
});
