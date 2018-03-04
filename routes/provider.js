var router = require('express').Router();
var providerCntrl = require('../controllers/server.provider.controller');

router.get('/add-category', function(req, res) {
  return providerCntrl.getAddCategory(req,res);
});


router.post('/add-category', function(req, res, next) {
  return providerCntrl.postAddCategory(req,res,next);
});
router.get('/add-product', function(req, res) {
    return providerCntrl.getAddProduct(req,res);
});


router.post('/add-product', function(req, res, next) {
    return providerCntrl.postAddProduct(req,res,next);
});


module.exports = router;
