const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
const db = new sqlite3.Database('./cmail.db');

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
app.use(express.static('public'));
app.use(express.static('views'));

// route to get HTML form
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/loginPage.html');
});

  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
