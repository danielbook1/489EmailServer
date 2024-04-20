const express = require('express');
const session = require('express-session');
const { google } = require('googleapis');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
const db = new sqlite3.Database('./cmail.db');

// gmail api constants
const CLIENT_ID = '59708220095-em4upqmrn6vjg90a24e2r4jr794s4mqj.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'http://localhost:3000';
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.modify'
];
const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);
const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true
});

// create table if needed
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            admin TEXT NOT NULL
            )`);

    db.run(`CREATE TABLE IF NOT EXISTS RefreshTokens (
            refreshToken TEXT NOT NULL,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            FOREIGN KEY (username) REFERENCES Users(username),
            PRIMARY KEY (username, email)
            )`);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
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
app.get('/', async (req, res) => {
    if (req.session && req.session.userId){
        const { code } = req.query;
        if (code) {
            try {
                const { tokens } = await oauth2Client.getToken(code)
                if (tokens.refreshToken){
                    console.log(tokens.refreshToken)
                    // saveTokenToDatabase(tokens.refreshToken)
                }
            }
            catch (error) {
                console.error('Error exchanging authorization code for tokens:', error);
                res.sendStatus(500);
            }
        }

        res.sendFile(__dirname + '/views/home.html');
    }
    else{
        res.sendFile(__dirname + '/views/loginPage.html');
    }
});

// routes that require user to be logged in
app.get('/home.html', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});

//Logout route
app.get('/logout', requireLogin, (req, res) => {
    res.sendFile(__dirname + '/views/logout.html');
});

function saveTokenToDatabase(refreshToken, username, email) {
    const sql = 'INSERT INTO RefreshTokens (refreshToken, username, email) VALUES (?, ?, ?)';
    db.run(sql, [refreshToken, username, email], function(err) {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log('Refresh token saved in database');
        }
    });
}

function getTokenFromDatabase(username, email) {
    const sql = 'SELECT refreshToken FROM RefreshTokens WHERE username = ? && email = ?';
    db.get(sql, [username, email], (err,row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } 
        else if (row) {
            return row.refreshToken;
        }
    });
}

function getEmailsFromDatabase(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM RefreshTokens WHERE username = ?';
        db.all(sql, [username], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const emails = rows.map(row => row.email);
            resolve(emails);
        });
    });
}
// route to handle signup form
app.post('/submitNewUser', (req, res) => {
    const {username, password} = req.body;
    const isAdmin = "no"

    // Insert data into database
    const sql = 'INSERT INTO Users (username, password, admin) VALUES (?, ?, ?)';
    db.run(sql, [username, password, isAdmin], function(err) {
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

// route to handle add email
app.post('/addEmail', requireLogin, (req, res) => {
    res.json({ authorizationUrl });
});

app.get('/oauth2callback', async (req, res) => {
    console.log("reached the callback")
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//Add Admin route
app.get('/admin',(req, res) => {
  let sql;
  //Opens the db
  const db = new sqlite3.Database('cmail.db', (err)=>{
    if(err) 
      {
        console.log("1")
        return console.error(err)
      }
  })
  console.log("DB Opened")

  //Gets all the users to pass into the table in admin.ejs
  db.all('SELECT * FROM Users', (err, rows) =>{
    if(err){
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log({Users: rows})
    res.render('admin', {Users: rows});
  })
});

//Admin post route
app.post('/admin', (req, res) => {
    const { username, password, formType } = req.body;
    //Open up db
    const db = new sqlite3.Database('cmail.db', (err)=>{
        if(err) 
        {
            console.log("1")
            return console.error(err)
        }
    })

    //Action when promoteUser form is submitted
    if(formType === 'promoteUser')
    {
        const promoteToAdmin = `UPDATE Users SET admin = ? WHERE username = ? AND password = ?`
        const yes = 'yes'
        db.run(promoteToAdmin, [yes, username, password], function(err) {
            if (err) {
              console.error('Error cannot promote to Admin: ', err.message);
              return;
            }
            console.log('Value updated successfully.');
          }); 
        db.close();
    }

    //Action when deleteUser is submitted
    else if(formType === 'deleteUser')
    {
        const promoteToAdmin = `DELETE FROM Users WHERE username = ? AND password = ?`
        const yes = 'yes'
        db.run(promoteToAdmin, [username, password], function(err) {
            if (err) {
              console.error('Error cannot delete user: ', err.message);
              return;
            }
            console.log('User deleted successfully.');
          }); 
        db.close();
    }

    //Action for when logout is submitted
    else if(formType === 'logOut')
    {
        res.status(200).send('User authentication successful');
    }

    let sql;
    const db2 = new sqlite3.Database('cmail.db', (err)=>{
        if(err) 
        {
            console.log("1")
            return console.error(err)
        }
    })

    db2.all('SELECT * FROM Users', (err, rows) =>{
        if(err){
        res.status(500).send('Internal Server Error');
        return;
        }
        console.log({Users: rows})
        res.render('admin', {Users: rows});
    })
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('routes'));