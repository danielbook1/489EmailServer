# CMail - A 489 Email Server

## How to initialize and run the server:
1. Initialize Node: npm init -y
2. Install express and sqlite3: npm install express sqlite3
3. Install ejs: npm install ejs
4. install express-session: npm install express-session
5. Install google apis: npm install googleapis
6. Run the server: node app.js

## About the Google API
In order to make the app work with the Google API, we had to create an OAuth consent screen. The consent screen is still in the testing phase which means that Google has not verified our app. The only caveat to this is that we must manually add emails as test users in order for them to be successfully authenticated by OAuth. Please reach out to me (daniel.book@wsu.edu) if you need to be added as a test user to test the authentication portion of our app.