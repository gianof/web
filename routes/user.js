var router = require('express').Router();
var User = require('../models/user');
var passport = require('passport');
var passportConf = require('../config/passport');
var userCntrl = require('../controllers/server.user.controller');

router.get('/login', function(req, res) {
  return userCntrl.getLogin(req,res);
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile', passportConf.isAuthenticated, function(req, res, next) {
  User
    .findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser) {
      if (err) return next(err);

      res.render('accounts/profile', { user: foundUser });
    });
});

router.get('/forgot', function (req, res) {
  return userCntrl.getForgot(req,res);
});

router.get('/signup', function(req, res, next) {
  return userCntrl.getSignup(req,res);
});

router.post('/signup', function(req, res, next) {
  return userCntrl.postSignup(req,res,next)
});


router.get('/logout', function(req, res) {
  return userCntrl.getLogout(req,res);
});

router.get('/edit-profile', function(req, res, next) {
  return userCntrl.getEditProfile(req,res);
});

router.post('/edit-profile', function(req, res, next) {
  return userCntrl.postEditProfile(req,res,next);
});

module.exports = router;
