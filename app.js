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
const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client
});

// create table if needed
db.serialize(() => {
    // db.run(`CREATE TABLE IF NOT EXISTS Users (
    //         username TEXT PRIMARY KEY,
    //         password TEXT NOT NULL,
    //         admin TEXT NOT NULL
    //         )`);
    // Check if the Users table exists
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='Users'", (err, row) => {
        if (err) {
            console.error('Error checking Users table:', err.message);
        } 
        else {
            if (!row) {
                // Table does not exist, create it
                db.run(`CREATE TABLE Users (
                        username TEXT PRIMARY KEY,
                        password TEXT NOT NULL,
                        admin TEXT NOT NULL
                        )`, (err) => {
                    if (err) {
                        console.error('Error creating Users table:', err.message);
                    } 
                    else {
                        console.log('Users table created successfully');

                        // Insert the default admin user
                        const defaultAdminUsername = 'admin';
                        const defaultAdminPassword = 'admin';
                        const defaultAdminAdminStatus = 'yes';

                        const insertAdminSql = 'INSERT INTO Users (username, password, admin) VALUES (?, ?, ?)';
                        db.run(insertAdminSql, [defaultAdminUsername, defaultAdminPassword, defaultAdminAdminStatus], function(err) {
                            if (err) {
                                console.error('Error inserting default admin user:', err.message);
                            } 
                            else {
                                console.log('Default admin user inserted successfully');
                            }
                        });
                    }
                });
            }
        }
    });

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

// url requirements
const requireLogin = (req, res, next) => {
    if (req.session && req.session.userId) {
        // User is authenticated, proceed to the next middleware
        next();
    }
    else {
        // User is not authenticated, redirect to login page
        res.redirect('/loginPage.html');
    }
}

const requireNoLogin = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        // User is not logged in, proceed to next middleware
        next();
    }
    else {
        // User is authenticated, redirect to home page
        res.redirect('/home.html');
    }
}

const requireAdmin = async (req, res, next) => {
    if ((await isAdmin(req.session.userId)) === 'yes') {
        // User is admin, proceed to next middleware
        next();
    }
    else {
        // User is not admin, redirect to home page
        res.redirect('/home.html');
    }
}

const requireNoAdmin = async (req, res, next) => {
    if((await isAdmin(req.session.userId)) === 'no') {
        // User is not admin, proceed to next middleware
        next();
    }
    else {
        // User is admin, redirect to admin page
        res.redirect('/admin');
    }
}

async function isAdmin(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT admin FROM Users WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } 
            else if (row) {
                resolve(row.admin);
            } 
            else {
                resolve(null); // Resolve with null if no row found
            }
        });
    });
}

// view handlers
app.get('/email.html', requireLogin, requireNoAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/email.html');
});

app.get('/home.html', requireLogin, requireNoAdmin, (req, res) => {
    res.sendFile(__dirname + '/views/home.html');
});

app.get('/loginPage.html', requireNoLogin, (req, res) => {
    res.sendFile(__dirname + '/views/loginPage.html');
});

app.get('/newUser.html', requireNoLogin, (req, res) => {
    res.sendFile(__dirname + '/views/newUser.html');
});

app.get('/admin', requireLogin, requireAdmin, (req, res) => {
    //Opens the db
    const db = new sqlite3.Database('cmail.db', (err)=>{
        if(err) {
            console.log("1");
            return console.error(err);
        }
    });
    console.log("DB Opened");
  
    //Gets all the users to pass into the table in admin.ejs
    db.all('SELECT * FROM Users', (err, rows) =>{
        if(err) {
            res.status(500).send('Internal Server Error');
            return;
        }
        console.log({Users: rows});
        res.render('admin', {Users: rows});
    });
  });

app.get('/', async (req, res) => {
    if (req.session && req.session.userId){
        const { code } = req.query;
        // code to run when new email is being authenticated
        if (code) {
            try {
                const { tokens } = await oauth2Client.getToken(code)
                if (tokens.refresh_token){
                    oauth2Client.setCredentials({access_token : tokens.access_token});
                    const profile = await gmail.users.getProfile({ userId: 'me' });
                    const emailAddress = profile.data.emailAddress;

                    // await ensures that the token is saved before moving on to other operations
                    await saveTokenToDatabase(tokens.refresh_token, req.session.userId, emailAddress);
                }
            }
            catch (error) {
                console.error('Error exchanging authorization code for tokens:', error);
                res.sendStatus(500);
            }
        }

        res.redirect('/home.html');
    }
    else{
        res.redirect('/loginPage.html');
    }
});

// other request handlers
app.get('/loadEmails', async (req, res) => {
    res.json(await getEmailsFromDatabase(req.session.userId));
});

app.post('/loadRecentMessages', async (req, res) => {
    // get refresh token from database using user and email (from req)
    const email = req.body.currentEmail;
    const folder = req.body.folder;

    refreshToken = await getTokenFromDatabase(req.session.userId, email);

    // trade refresh token for access token
    oauth2Client.setCredentials({refresh_token : refreshToken});
    accessToken = (await oauth2Client.getAccessToken()).token;

    // log to console something using access token
    oauth2Client.setCredentials({access_token : accessToken});
    const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 2,
        q: 'in:'.concat(folder)
    });

    const messages = response.data.messages;
    if (messages) {
        const messageIds = messages.map(message => message.id);
        const fullMessages = await Promise.all(messageIds.map(messageId => getMessageDetails(messageId)));

        res.json(fullMessages);
    }
    else{
        res.json(null);
    }
});
async function getMessageDetails(messageId) {
    try {
        const response = await gmail.users.messages.get({ userId: 'me', id: messageId });
        return response.data;
    } catch (error) {
        console.error(`Error fetching message with ID ${messageId}:`, error);
        throw error;
    }
}

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

                    // Redirect to home page
                    return res.redirect('/home.html');
                } 
                else {
                    // Password doesn't match, send error message
                    return res.status(401).send('Incorrect password');
                }
            } 
            else {
                // User not found, send error message
                return res.status(404).send('User not found');
            }
        }
    });
});

app.post('/logout', (req, res) => {
    req.session.userId = undefined;
    res.redirect('/loginPage.html');
});

app.post('/addEmail', requireLogin, (req, res) => {
    res.json({ authorizationUrl });
});

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

// database functions
async function saveTokenToDatabase(refreshToken, username, email) {
    let sql = 'INSERT INTO RefreshTokens (refreshToken, username, email) VALUES (?, ?, ?)';
    db.run(sql, [refreshToken, username, email], function(err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                sql = 'UPDATE RefreshTokens SET refreshToken = ? WHERE username = ? AND email = ?';
                db.run(sql, [refreshToken, username, email], function(updateErr) {
                    if (updateErr) {
                        console.error('Error updating refresh token:', updateErr.message);
                    }
                    else {
                        console.log('Refresh token updated in database');
                    }
                });
            }
            else{
                console.error(err.message);
            }
        }
        else {
            console.log('Refresh token saved in database');
        }
    });
}

async function getTokenFromDatabase(username, email) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT refreshToken FROM RefreshTokens WHERE username = ? AND email = ?';
        db.get(sql, [username, email], (err, row) => {
            if (err) {
                console.error(err.message);
                reject(err);
            } 
            else if (row) {
                resolve(row.refreshToken);
            } 
            else {
                resolve(null); // Resolve with null if no row found
            }
        });
    });
}

function getEmailsFromDatabase(username) {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT email FROM RefreshTokens WHERE username = ?';
        db.all(sql, [username], (err, rows) => {
            if (err) {
                console.log("error fetching emails from database");
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

// setup and load the website
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('routes'));