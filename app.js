const express = require('express');
const app = express();
const port = 3000;
const db = new sqlite3.Database('./cmail.db');

// create table if needed
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
            email TEXT PRIMARY KEY,
            password TEXT NOT NULL)`
    );
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
