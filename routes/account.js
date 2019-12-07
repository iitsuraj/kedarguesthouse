var express = require("express");
var router = express.Router();
var User = require("../models/user");
var id = require("shortid");
var passport = require("passport");
var passportConf = require("../config/passport");
var mailer = require("../misc/mailer");
var mongoose = require("mongoose");

router.get("/register", function(req, res, next) {
  res.render("panel/register", { message: req.flash("message") });
});
router.post("/register", function(req, res, next) {
  var user = new User();
  user.email = req.body.email;
  user.password = req.body.password;
  User.findOne({ email: req.body.email }, function(_err, existingUser) {
    if (existingUser) {
      req.flash("message", "email already exist");
      res.redirect("/login");
    } else {
      user.save(function(err, user) {
        if (err) return next(err);
        req.logIn(user, function(err) {
          if (err) return next(err);
          res.redirect("/panel");
        });
      });
    }
  });
});
router.get("/login", function(req, res, next) {
  res.render("panel/login", { message: req.flash("message") });
});

router.post(
  "/login",
  passport.authenticate("local-login", {
    successRedirect: "/panel",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/logout", function(req, res, next) {
  req.logOut();
  res.redirect("/");
});

module.exports = router;
