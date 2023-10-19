const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const PORT = 8080; // default port 8080

//generateRandomString function goes here
function generateRandomString(length) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase,
  
    // ... can add other variables want to pass
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"], // Pass the 'username' to the template
    // ... can add other variables want to pass
  };
  res.render("urls_new", templateVars);
});

app.use(express.urlencoded({ extended: true }));

// POST route to handle form submission
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.set('view engine', 'ejs'); // This line sets EJS as view engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase }; // Pass the urlDatabase to the template
  res.render("urls_index", templateVars); // Render the "urls_index.ejs" template
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// Route to handle short URL redirects
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// route to handle the DELETE operation
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  // Check if the shortURL exists in your database
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    // Handle the case where the shortURL doesn't exist
    res.status(404).send("Short URL not found.");
  }
});
//route to handle the edit operation
app.post("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const updatedLongURL = req.body.longURL;
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  res.cookie('username', username);
  res.redirect('/urls');
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
