var Category = require('../models/category');
var Product = require('../models/product');
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
exports.postAddCategory = function (req, res, next) {
    var category = new Category();
    category.name = req.body.name;

    category.save(function(err) {
        if (err) return next(err);
        req.flash('success', 'Η κατηγορία προστέθηκε επιτυχώς');
        return res.redirect('/add-category');
    });
};

exports.getAddCategory = function (req, res) {
    res.render('provider/add-category', { message: req.flash('success') });
};

exports.getAddProduct =function (req, res) {
    res.render('provider/add-product', {
        message: req.flash('success')
    });
};

exports.postAddProduct = function (req, res, next) {
    async.waterfall([
        function (callback) {
            geocoder.geocode(req.body.address, function(err, results) {
                callback(null,results);

            });
        },
        function(results,callback) {
            Category.findOne({ name: req.body.category }, function(err, category) {
                if (!category) {
                    req.flash('errors', 'Αυτή η κατηγορία δεν υπάρχει.');
                    return res.redirect('/add-product');
                }
                else{
                    if (err) return next(err);
                    callback(null, category,results);
                }

            });
        },

        function(category,results, callback) {
            var product = new Product();
            product.category = category._id;
            product.name = req.body.name;
            product.address = req.body.address;
            product.ages = req.body.age;
            product.price = req.body.price;
            product.coordinates.longitude = results[0].longitude;
            product.coordinates.latitude = results[0].latitude;
            product.image= req.body.photo;
            callback(null,product);

        },
            function (product, callback) {
                product.save(function(err) {
                    if (err) return next(err);
                    req.flash('success', 'Το προϊόν προστέθηκε επιτυχώς!');
                    return res.redirect('/add-product');
                });
            }
    ]);
}