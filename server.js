'use strict';

require('dotenv').config();

const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session')
const passport = require('passport')
const app = express();
const LocalStrategy = require('passport-local');
const { ObjectID } = require('mongodb');
fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'pug')
app.set('views','./views/pug' )

// app.route('/').get((req, res) => {
// res.render('index', {title : "Hello", message : "Please log in"});
// });

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

  // Be sure to change the title
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('index', {
      showLogin: true,
      title: 'Connected to Database',
      message: 'Please login'
    });
  });

  app.route('/login').post( passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    }
);
  
  app.route('/profile').get(ensureAuthenticated, (req,res) => {
    res.render('profile', { username : req.user.username });
  })

  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
});

app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});

  //Authentication strategies
  passport.use(new LocalStrategy((username, password, done) => {
  
    console.log('LocalStrategy', myDataBase)

  myDataBase.findOne({ username : username}, (err, user) => {
    
  console.log(`User ${username} attempt to log in.`);
   
    if(err) return done(err );
    if(!user) return done(null, false);
    if(password !== user.password) return done(null, false);
    return done(null, user);
  })
}))
//

  // Serialization and deserialization here...

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ _id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    });
  });

  // Be sure to add this...
}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});
// app.listen out here...
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});