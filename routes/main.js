var router = require('express').Router();
var mainCntrl = require('../controllers/server.main.controller');

router.get('/cart', function(req, res, next) {
  return mainCntrl.getCart(req,res,next);
});

router.post('/product/:product_id', function(req, res, next) {
  return mainCntrl.postProduct(req,res,next);
});


router.post('/remove', function(req, res, next) {
  return mainCntrl.postRemove(req,res,next);
});

router.post('/search', function(req, res) {
  return mainCntrl.postSearch(req,res);
});

router.get('/search', function(req, res, next) {
  return mainCntrl.getSearch(req,res,next);
});

router.get('/', function(req, res, next) {
  return mainCntrl.getHome(req,res,next);
});

router.get('/page/:page', function(req, res, next) {
  return mainCntrl.getPage(req,res,next);
});

router.get('/about', function(req, res) {
  return mainCntrl.getAbout(req,res);
});

router.get('/products/:id', function(req, res, next) {
  return mainCntrl.getProducts(req,res,next);
});


router.get('/product/:id', function(req, res, next) {
  return mainCntrl.getProduct(req,res,next);
});



router.post('/payment', function(req, res, next) {
  return mainCntrl.postPayment(req,res,next);
});

router.post('/index/filters', function (req,res,next) {
    return mainCntrl.postFilter(req,res,next);
});
router.get('/index/filters', function (req,res,next) {
    return mainCntrl.getFilter(req,res,next);
});

router.post('/test/geo', function(req,res,next){
  return mainCntrl.postTestGeo(req,res,next);
});
router.get('/bonusInfo', function (req,res) {
  return mainCntrl.getBonusInfo(req,res);

})
module.exports = router;
