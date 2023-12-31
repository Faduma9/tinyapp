// Import necessary modules
const express = require("express");
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing
const { getUserByEmail } = require('./helpers');


app.use(cookieSession({
  name: 'session',
  keys: ['your-secret-key'],
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
}));
// Set the view engine to EJS
app.set('view engine', 'ejs');

// port number
const PORT = 8080;

const urlDatabase = {
  "b6UTxQ": {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  "i3BoGr": {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
function findUserByEmail(email) {
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

//Redirection for Root Path ("/"):
app.get("/", (req, res) => {
  res.redirect("/urls");
});



// Define the "/urls/new" route for creating a new URL
app.get("/urls/new", (req, res) => {
  const user = users[req.session
    .user_id]; // Retrieve the user from cookies

  if (user) {
    const templateVars = {
      user,
    };
    res.render("urls_new", templateVars); // Render the "urls_new" template
  } else {
    res.redirect("/login"); // Redirect to the "/login" page if not logged in
  }
});


// Define the POST route for submitting a new URL
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id]; // Retrieve the user from cookies

  if (user) {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(6); // Generate a short URL
    urlDatabase[shortURL] = {
      longURL,
      userID: user.id, // Store the user ID along with the URL
    };
    res.redirect(`/urls/${shortURL}`); // Redirect to the newly created URL
  } else {
    // Respond with an HTML message explaining why they cannot create URLs
    res.status(403).send("You must be logged in to create URLs.");
  }
});


// Logout route - Clear cookies and redirect to login
app.post("/logout", (req, res) => {
  req.session = null; // Clear the session
  res.redirect("/login");
});



// Define the "/urls/:id" route for showing details of a specific URL
app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id]; // Retrieve the user from cookies
  if (!user) {
    return res.redirect("/login");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("URL not found");
  }
  const templateVars = {
    user: users[req.session.user_id], // Retrieve the user from cookies
    id: req.params.id, // Retrieve the URL's ID
    longURL: urlDatabase[req.params.id].longURL, // Retrieve the URL from the database
  };
  res.render("urls_show", templateVars); // Render the "urls_show" template
});

// Define the "/u/:id" route for redirecting to the long URL
app.get("/u/:id", (req, res) => {
  const user = users[req.session.user_id]; // Retrieve the user from cookies
  if (!user) {
    return res.redirect("/login");
  }
  if (!urlDatabase[req.params.id]) {
    return res.send("URL not found");
  }
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL); // Redirect to the long URL
});


//delete route
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.session.user_id]; // Retrieve the user from cookies
  const shortURL = req.params.id;

  if (user && urlDatabase[shortURL] && urlDatabase[shortURL].userID === user.id) {
    delete urlDatabase[shortURL]; // Delete the URL from the database
    res.redirect("/urls"); // Redirect to the "/urls" page
  } else {
    res.status(404).send("URL not found.");
  }
});



app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedLongURL; // Update the URL in the database
  res.redirect("/urls"); // Redirect to the "/urls" page
});




// Define the POST route for handling user login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Look up the user by email in the users object
  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403).send("User with this email does not exist.");
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Incorrect password.");
  }

  // Successful login, set the user's session and redirect
  req.session.user_id = user.id;
  res.redirect("/urls");
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
  users[userId] = { id: userId, email, password: bcrypt.hashSync(password, 10) };
  req.session.user_id = userId;
  res.redirect("/urls");
});

// Create a GET Route for /login
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id], // Retrieve the user from cookies
  };
  res.render("login", templateVars);
});

// Create a GET Route for /register
app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render('registration', templateVars);
});

// Login route - Redirect to "/urls" if already logged in
app.get("/login", (req, res) => {
  // Check if the user is already logged in
  if (req.session.user_id && users[req.session.user_id]) {
    res.redirect("/urls"); // Redirect to /urls if logged in
  } else {
    const templateVars = {
      user: users[req.session.user_id], // Retrieve the user from cookies
    };
    res.render("login", templateVars);
  }
});

// Create a GET Route for /register
app.get('/register', (req, res) => {
  // Check if the user is already logged in
  if (req.session.user_id && users[req.session.user_id]) {
    res.redirect("/urls"); // Redirect to /urls if logged in
  } else {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render('registration', templateVars);
  }
});

// Define the "/u/:id" route for redirecting to the long URL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    res.redirect(longURL); // Redirect to the long URL if it exists
  } else {
    // Respond with a relevant HTML error message if the ID does not exist
    res.status(404).send("<p>Short URL not found. Please check the URL and try again.</p>");
  }
});


app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    const userURLs = urlsForUser(user.id);
    const templateVars = {
      user,
      urls: userURLs,
    };
    res.render("urls_index", templateVars);
  } else {
    res.status(403).send("You must be logged in to view your URLs.");
  }

});

// Define the urlsForUser function to return URLs for a specific user ID
function urlsForUser(id) {
  const userURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
}


app.get("/urls/:id", (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;

  if (user) {
    if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === user.id) {
      const templateVars = {
        user,
        id: shortURL,
        longURL: urlDatabase[shortURL].longURL,
      };
      res.render("urls_show", templateVars);
    } else {
      res.status(403).send("You do not have permission to view this URL.");
    }
  } else {
    res.status(403).send("You must be logged in to view this URL.");
  }
});


// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
