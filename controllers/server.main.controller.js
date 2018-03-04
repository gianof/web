var Product=require('../models/product');
var User=require('../models/user');
var Cart = require('../models/cart');
var async = require('async');
var stripe = require('stripe') ('sk_test_OaeFe7zieODIxAgRYthVh0th');
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

function paginate(req, res, next) {

    var perPage = 9;
    var page = req.params.page;

    Product
        .find()
        .skip( perPage * page)
        .limit( perPage )
        .populate('category')
        .exec(function(err, products) {
            if (err) return next(err);
            Product.count().exec(function(err, count) {
                if (err) return next(err);
                res.render('main/product-main', {
                    products: products,
                    pages: count / perPage
                });
            });
        });

}
Product.createMapping(function(err, mapping) {
    if (err) {
        console.log("error creating mapping");
        console.log(err);
    } else {
        console.log("Mapping created");
        console.log(mapping);
    }
});

var stream = Product.synchronize();
var count = 0;

stream.on('data', function() {
    count++;
});

stream.on('close', function() {
    console.log("Indexed " + count + " documents");
});

stream.on('error', function(err) {
    console.log(err);
});

exports.getProduct = function (req, res,next) {
    Product.findById({ _id: req.params.id }, function(err, product) {
        if (err) return next(err);
        res.render('main/product', {
            product: product
        });
    });
};
exports.postProduct = function (req, res, next) {
    Cart.findOne({ owner: req.user._id }, function(err, cart) {
        cart.items.push({
            item: req.body.product_id,
            price: parseFloat(req.body.priceValue),
            quantity: parseInt(req.body.quantity)
        });

        cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

        cart.save(function(err) {
            if (err) return next(err);
            return res.redirect('/cart');
        });
    });
};
exports.getProducts = function (req, res, next) {
    Product
        .find({ category: req.params.id })
        .populate('category')
        .exec(function(err, products) {
            if (err) return next(err);
            res.render('main/category', {
                products: products
            });
        });
};

exports.getAbout = function (req, res) {
    res.render('main/about');
};

exports.postPayment = function (req, res,next) {

    var stripeToken = req.body.stripeToken;
    var currentCharges = Math.round(req.body.stripeMoney * 100);
    stripe.customers.create({
        source: stripeToken,
    }).then(function(customer) {
        return stripe.charges.create({
            amount: currentCharges,
            currency: 'eur',
            customer: customer.id
        });
    }).then(function(charge) {
        async.waterfall([
            function(callback) {
                Cart.findOne({ owner: req.user._id }, function(err, cart) {
                    callback(err, cart);
                });
            },
            function(cart, callback) {
                User.findOne({ _id: req.user._id }, function(err, user) {
                    if (user) {
                        for (var i = 0; i < cart.items.length; i++) {
                            user.history.push({
                                item: cart.items[i].item,
                                paid: cart.items[i].price
                            });
                        }

                        user.save(function(err, user) {
                            if (err) return next(err);
                            callback(err, user);
                        });
                    }
                });
            },
            function(user) {
                Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated) {
                    if (updated) {
                        res.redirect('/profile');
                    }
                });
            }
        ]);
    });
};

exports.getPage = function (req, res,next) {
    paginate(req,res,next);
};

exports.getHome = function (req, res, next) {

    if (req.user) {
        paginate(req, res, next);
    } else {
        res.render('main/home');
    }

};
exports.getSearch = function (req, res, next) {
    if (req.query.q) {
        Product.search({
            query_string: { query: req.query.q}
        }, function(err, results) {
            results:
                if (err) return next(err);
            var data = results.hits.hits.map(function(hit) {
                return hit;
            });
            res.render('main/search-result', {
                query: req.query.q,
                data: data
            });
        });
    }
};

exports.postSearch = function (req, res) {
    res.redirect('/search?q=' + req.body.q);
};

exports.postRemove = function (req, res, next) {
    Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
        foundCart.items.pull(String(req.body.item));

        foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
        foundCart.save(function(err, found) {
            if (err) return next(err);
            req.flash('remove', 'Successfully removed');
            res.redirect('/cart');
        });
    });
};

exports.getCart = function (req, res, next) {
    Cart
        .findOne({owner: req.user._id})
        .populate('items.item')
        .exec(function (err, foundCart) {
            if (err) return next(err);
            res.render('main/cart', {
                foundCart: foundCart,
                message: req.flash('remove')
            });
        });
};

exports.getFilter = function (req,res,next) {
    if (req.user) {
        res.render('main/filter')
    } else {
        res.render('main/home');
    }
}
exports.postFilter = function (req,res,next) {
    async.waterfall([
        function(callback) {
            User.findOne({ _id: req.user._id }, function(err, user) {
                callback(err,user)
            })

        },
        function (user,callback) {
        //fix so the fields are not necessary
            if(req.body.ageGte=="" || !isNaN(req.body.ageGte)) req.body.ageGte=0;
            if(req.body.ageLt=="" || !isNaN(req.body.ageLt)) req.body.ageLt=150;
            if(req.body.priceGte=="" || !isNaN(req.body.priceGte)) req.body.priceGte=0;
            if(req.body.priceLt=="" || !isNaN(req.body.priceLt)) req.body.priceLt=Number.MAX_SAFE_INTEGER;
            if(req.body.kilometers=="" || !isNaN(req.body.kilometers)) req.body.kilometers=10000;
            if(req.body.category==""){
                Product.find({price:{'$gte':req.body.priceGte, '$lt':req.body.priceLt},
                    ages:{'$gte':req.body.ageGte, '$lt':req.body.ageLt},
                    coordinates:{'$geoWithin':{$centerSphere:[[user.coordinates.latitude, user.coordinates.longitude], (req.body.kilometers)/6378.1]}} //sphere distance with a given radius with center the user
                },function (err, result) {
                    res.json(result);
                })
            }
                else{
                Product.find({price:{'$gte':req.body.priceGte, '$lt':req.body.priceLt},
                    category: req.body.category,
                    ages:{'$gte':req.body.ageGte, '$lt':req.body.ageLt},
                    coordinates:{'$geoWithin':{$centerSphere:[[user.coordinates.latitude, user.coordinates.longitude], (req.body.kilometers)/6378.1]}} //sphere distance with a given radius with center the user
                },function (err, result) {
                    res.json(result);
                })
            }

        }

        ])

};
exports.postTestGeo = function (req,res,next) {
    var address = req.body.address;
    geocoder.geocode(address, function(err, results) {
        res.json(results[0])
        //var objsArray = [];
        //var objsArray = JSON.parse(results);
        console.log("Address: ", results[0].formattedAddress);
        console.log("Latitude: ", results[0].latitude);
        console.log("Longitude: ", results[0].longitude);

    });
}


