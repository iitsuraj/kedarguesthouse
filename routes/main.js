var express = require("express");
var router = express.Router();

router.get("/", function(req, res, next) {
  res.render("main/index");
});

router.get("/facilities", function(req, res, next) {
  res.render("main/facilities");
});

router.get("/reservation", function(req, res, next) {
  res.render("main/reservation");
});
router.get("/about", function(req, res, next) {
  res.render("main/about");
});
router.get("/faq", function(req, res, next) {
  res.render("main/faq");
});
router.get("/guestbook", function(req, res, next) {
  res.render("main/guestbook");
});
router.get("/reservation/test", function(req, res, next) {
  res.render("main/room");
});
router.get("/book", function(req, res, next) {
  res.render("main/book");
});

module.exports = router;
