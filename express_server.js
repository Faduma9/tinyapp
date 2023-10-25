// Import necessary modules
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
app.use(cookieParser());
// Set the view engine to EJS
app.set('view engine', 'ejs');

// Define the port number
const PORT = 8080;

// Sample database for storing URLs
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// Define your `users` object to store registered users
const users = {};

// Function to generate a random string for short URLs
function generateRandomString(length) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}
//define finduser
function findUserByEmail (email){
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
  
    }
  }
  return null;
}


// Parse URL-encoded request bodies with extended mode
app.use(express.urlencoded({ extended: true }));

// Define the root route
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Define the "/urls" route for displaying a list of URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Retrieve the user from cookies
    urls: urlDatabase, // Pass the URL database
  };
  res.render("urls_index", templateVars); // Render the "urls_index" template
});

// Define the "/urls/new" route for creating a new URL
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Retrieve the user from cookies
  };
  res.render("urls_new", templateVars); // Render the "urls_new" template
});

// Define the POST route for submitting a new URL
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6); // Generate a short URL
  urlDatabase[shortURL] = longURL; // Add the URL to the database
  res.redirect(`/urls/${shortURL}`); // Redirect to the newly created URL
});

// Define the "/logout" route for logging out and clearing the "user_id" cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); // Clear the "user_id" cookie
  res.redirect("/login"); // Redirect to the "/login" page
});

// Define the "/urls.json" route for returning the URL database in JSON format
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // Respond with the URL database in JSON format
});

// Define the "/urls/:id" route for showing details of a specific URL
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Retrieve the user from cookies
    id: req.params.id, // Retrieve the URL's ID
    longURL: urlDatabase[req.params.id], // Retrieve the URL from the database
  };
  res.render("urls_show", templateVars); // Render the "urls_show" template
});

// Define the "/u/:id" route for redirecting to the long URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL); // Redirect to the long URL
});

// Define the POST route for deleting a URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL]; // Delete the URL from the database
    res.redirect("/urls"); // Redirect to the "/urls" page
  } else {
    res.status(404).send("Short URL not found.");
  }
});

// Define the POST route for editing a URL
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL; // Update the URL in the database
  res.redirect("/urls"); // Redirect to the "/urls" page
});

// Define the POST route for handling user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
   // Look up the user by email in the users object
   const user = findUserByEmail(email);

       if (!user) {
        return res.status(403).send("Email or user not found.");
       }
       if (bcrypt.compareSync(password, user.password)) {
         res.cookie("user_id", user.id);
         return res.redirect("/urls");
       }
   res.status(403).send("Email or password is incorrect.");
 });

// Define a test route for displaying a greeting
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.post("/register", (req, res) => {
  const userId = generateRandomString(6);
  const { email, password } = req.body;

  for (const existingUserId in users) {
    if (users[existingUserId].email === email) {
      res.status(400).send('Email is already registered.');
      return;
    }
  }

  users[userId] = { id: userId, email, password:bcrypt.hashSync(password, 10)};
  res.cookie("user_id", userId);
  res.redirect("/urls");
});

// Create a GET Route for /login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Retrieve the user from cookies
  };
  res.render("login", templateVars);
});

// Create a GET Route for /register
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
  };
  res.render('registration', templateVars);
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
