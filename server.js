'use strict';

require('dotenv').config();
const passport = require('passport')
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const routes = require('./routes.js');
const auth = require('./auth.js');
const session = require('express-session')

const app = express();


const e = require('express');

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug')
app.set('views','./views/pug' )

//Create the variables session and passport to require express-session and passport
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

   //Set up passport
   app.use(passport.initialize());
   app.use(passport.session());

myDB(async dbClient => {

  const myDataBase = await dbClient.db('database').collection('users');
  routes(app, myDataBase);
  auth(app,myDataBase);
  
  // Be sure to add this...
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});