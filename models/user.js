var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Schema = mongoose.Schema;
//for the map feature
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
/* The user schema attributes / characteristics / fields */
var UserSchema = new Schema({

    email: { type: String, unique: true, lowercase: true},
    password: String,

    profile: {
        name: { type: String, default: ''},
        picture: { type: String, default: ''}
    },

    role: {type: String, required: true},

    bonusPoints: {type:Number, default: 0},

    address: String,
    coordinates:{
        latitude: { type: Number, default: 0},
        longitude: { type: Number, default: 0}
    },

    history: [{
        paid: { type: Number, default: 0},
        item: { type: Schema.Types.ObjectId, ref: 'Product'}
    }],

    products:[{
        item: { type: Schema.Types.ObjectId, ref: 'Product'}
    }]
});

/*  Hash the password and edit the address (coordinates) before we even save it to the database */
UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/* compare password in the database and the one that the user type in */
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

UserSchema.methods.gravatar = function(size) {
  if (!this.size) size = 200;
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}


module.exports = mongoose.model('User', UserSchema);
