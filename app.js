const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
const db = new sqlite3.Database('./cmail.db');


const homeRouter = require('./routes/home');
const addEmailRouter = require('./routes/addEmail');
const logoutRouter = require('./routes/logout');

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use('/home', homeRouter);
app.use('/addEmail', addEmailRouter);
app.use('/logout', logoutRouter);

// create table if needed
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )`);

    db.run(`CREATE TABLE IF NOT EXISTS Emails (
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            username TEXT NOT NULL,
            FOREIGN KEY (username) REFERENCES Users(username),
            PRIMARY KEY (email, username)
        )`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const requireLogin = (req, res, next) => {
    if (req.session && req.session.userId) {
      // User is authenticated, proceed to the next middleware
      next();
    }
    else {
      // User is not authenticated, redirect to login page
      res.sendFile(__dirname + '/views/loginPage.html');
    }
};

// route to get HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/loginPage.html');
});

// routes that require user to be logged in
app.get('/home.html', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});

// route to handle signup form
app.post('/submitNewUser', (req, res) => {
    const {username, password} = req.body;

    // Insert data into database
    const sql = 'INSERT INTO Users (username, password) VALUES (?, ?)';
    db.run(sql, [username, password], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } 
        else {
            console.log('Form submitted successfully')
            res.status(200).send('Form submitted successfully');
        }
    });
});

// route to handle login form
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query the database to retrieve the user's password based on the username
    const sql = 'SELECT password FROM Users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } 
        else {
            if (row) {
                // If a user with the given username exists, check if the password matches
                if (row.password === password) {
                    // Password matches, authentication successful
                    req.session.userId = username;
                    res.status(200).send('User authentication successful');
                } 
                else {
                    // Password doesn't match
                    res.status(401).send('Incorrect password');
                }
            } 
            else {
                // User not found
                res.status(404).send('User not found');
            }
        }
    });
});
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('routes'));