const bcrypt = require('bcrypt');
const passport = require('passport')
module.exports = function(app, myDataBase){

    // Be sure to change the title
    app.route('/').get((req, res) => {
        // Change the response to render the Pug template
        res.render('index', {
          title: 'Connected to Database',
          message: 'Please login', 
          showLogin: true,
          showRegistration: true,
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
    app.route('/register')
.post((req, res, next) =>{
  //1. Register the new user
  //1.1 Query database with findOne

   myDataBase.findOne({ username : req.body.username }, (err, user) => {
     //1.2 If there's an error, call next with error
    if(err){
      next(err);
    }
      //1.3 If a user is returned, redirect back to home
    else if(user ){
      res.redirect('/');
      //1.4 If a user is not found and no error ocurr, then insert One.
      //    authenticating the new user, which you already wrote the logic  
      //    for in your POST /login route.  
    }else{
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDataBase.insertOne({ username: req.body.username, password: hash }, (err, doc) => {
        if(err){
          res.redirect('/');
        }
        else{
          next(null, doc.ops[0]);
        }
      })
    }      
   })
}, 
//    As long as no errors occur there, call next to go to step 2, 
//2 . Authenticate the new user
passport.authenticate('local', { failureRedirect: '/' }), (req, res, next)=>{
  //Redirect to profile
 res.redirect('/profile');
}
);
}// app.listen out here...
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };