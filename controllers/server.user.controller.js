var User = require('../models/user');
var Cart = require('../models/cart');

var async = require('async');
var googleAPIkey = 'AIzaSyDyHTtyQoxHprhI03rOtBp6k0wyjXC1qP4';
var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',

    // Optional depending on the providers
    httpAdapter: 'https', // Default
    apiKey: googleAPIkey, // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);
exports.postSignup = function (req, res,next) {

    async.waterfall([
        function (callback) {
            geocoder.geocode(req.body.address, function(err, results) {
                    callback(null,results);

            });
        },
        function(results,callback) {
            var user = new User();

            user.profile.name = req.body.name;
            user.email = req.body.email;
            user.password = req.body.password;
            user.address = req.body.address;
            user.coordinates.longitude = results[0].longitude;
            user.coordinates.latitude = results[0].latitude;
            user.profile.picture = user.gravatar();
            //user.type = parse(req.body.userCategory);

            User.findOne({ email: req.body.email }, function(err, existingUser) {

                if (existingUser) {
                    req.flash('errors', 'Account with that email address already exists');
                    return res.redirect('/signup');
                } else {
                    user.save(function(err, user) {
                        if (err) return next(err);
                        callback(null, user);
                    });
                }
            });
        },

        function(user,callback) {
            var cart = new Cart();
            cart.owner = user._id;
            cart.save(function (err) {
                if (err) return next(err);
                req.logIn(user, function (err) {
                    if (err) return next(err);
                    res.redirect('/profile');
                });
            });
        }
    ]);
};
exports.getLogin = function (req, res) {
    if (req.user) return res.redirect('/');
    res.render('accounts/login', { message: req.flash('loginMessage')});
};

exports.getSignup = function (req, res) {
    res.render('accounts/signup', {
        errors: req.flash('errors')
    });
};

exports.getEditProfile=function (req, res) {
    res.render('accounts/edit-profile', { message: req.flash('success')});
};

exports.getLogout = function (req, res) {
    req.logout();
    res.redirect('/');
};

exports.postEditProfile = function (req, res, next) {
    User.findOne({ _id: req.user._id }, function(err, user) {

        if (err) return next(err);

        if (req.body.name) user.profile.name = req.body.name;
        if (req.body.address) user.address = req.body.address;

        user.save(function(err) {
            if (err) return next(err);
            req.flash('success', 'Successfully Edited your profile');
            return res.redirect('/edit-profile');
        });
    });
};

exports.getForgot = function (req, res) {
    res.render('accounts/forgot', {
        user: req.user
    });
};