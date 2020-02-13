var express = require("express");
var router = express.Router();
var Subscriber = require("../models/subscriber");
var Faq = require("../models/faq");
var Room = require("../models/room");
var Booking = require("../models/booking");
var Insta = require("instamojo-nodejs");
var url = require("url");
var mailer = require("../misc/mailer");
var moment = require("moment");
var Review = require("../models/review");
var async = require("async");
router.get("/", async function(req, res, next) {
  var reviews = await Review.find({ home: true })
    .limit(6)
    .sort({ createdAt: -1 })
    .exec();
  res.render("main/index", { reviews: reviews });
});

router.get("/facilities", function(req, res, next) {
  res.render("main/facilities");
});

router.get("/booknow", async function(req, res, next) {
  var rooms = await Room.find({})
    .sort({ createdAt: -1 })
    .exec();
  res.render("main/booknow", { rooms: rooms });
});
router.get("/faq", async function(req, res, next) {
  var faqs = await Faq.find({})
    .sort({ createdAt: -1 })
    .exec();
  res.render("main/faq", { faqs: faqs });
});
router.get("/booknow/:room", function(req, res, next) {
  var type = req.params.room;
  var roomtype = type.split("-").join(" ");
  Room.findOne({ type: roomtype }, function(err, room) {
    if (err) return res.redirect("/404");
    if (!room) return res.redirect("/404");
    res.render("main/room", { img: room.image });
  });
});
router.post("/booknow/:room", function(req, res, next) {
  var type = req.params.room;
  var roomtype = type.split("-").join(" ");
  Room.findOne({ type: roomtype }, function(err, room) {
    if (err) return res.redirect("/404");
    if (!room) {
      res.redirect("/404");
    } else {
      Insta.setKeys(
        "test_f049a86a97c0acbd66a8f203af0",
        "test_10e8fb58d56b63812bfa504e586"
      );
      var date1 = new Date(req.body.checkin);
      var date2 = new Date(req.body.checkout);
      var diffTime = Math.abs(date2 - date1);
      var diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        diffDays = 1;
      }
      Insta.isSandboxMode(true);
      const data = new Insta.PaymentData();
      data.purpose = `${room.type} - kedar guest house`;
      data.amount = room.price * diffDays;
      data.buyer_name = req.body.name;
      data.redirect_url = `https://kedarguesthouse.herokuapp.com/payresiveguestkedar?checkin=${req.body.checkin}&checkout=${req.body.checkout}&name=${req.body.name}&lastname=${req.body.lastname}&mobilenumber=${req.body.mobilenumber}&email=${req.body.email}&id=${room._id}`;
      data.email = req.body.email;
      data.phone = req.body.phone;
      data.send_email = true;
      data.send_sms = false;
      data.allow_repeated_payments = false;
      Insta.createPayment(data, function(error, response) {
        if (error) {
          // some error
          res.redirect("/404");
        } else {
          // Payment redirection link at response.payment_request.longurl
          const responseData = JSON.parse(response);
          const redirectUrl = responseData.payment_request.longurl;
          // console.log(responseData);
          // res.status(200).json(redirectUrl);
          res.redirect(redirectUrl);
        }
      });
    }
  });
});

var handlebars = require("handlebars");
var fs = require("fs");

var readHTMLFile = function(path, username, callback) {
  fs.readFile(path, { encoding: "utf-8" }, function(err, html) {
    if (err) {
      throw err;
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

router.get("/payresiveguestkedar/", function(req, res, next) {
  let url_parts = url.parse(req.url, true),
    responseData = url_parts.query;
  if (responseData.payment_id) {
    var booking = new Booking();
    booking.checkin = responseData.checkin;
    booking.checkout = responseData.checkout;
    booking.firstname = responseData.name;
    booking.lastname = responseData.lastname;
    booking.mobilenumber = responseData.mobilenumber;
    booking.email = responseData.email;
    booking.room = responseData.id;
    booking.paymentid = responseData.payment_id;
    booking.paymentstatus = responseData.payment_status;
    booking.payentreqid = responseData.payment_request_id;

    booking.save(function(err, save) {
      if (err) {
        res.redirect("404");
      }
      if (save) {
        readHTMLFile("Template/booking.html", save, function(err, html) {
          var template = handlebars.compile(html);
          var replacements = {
            username: save.firstname,
            id: save._id,
            checkin: moment(save.checkin).format("MM/DD/YYYY"),
            checkout: moment(save.checkout).format("MM/DD/YYYY")
          };
          var htmlToSend = template(replacements);
          var to = ["vk@kedarguesthouse.com", save.email];
          mailer.sendEmail(
            "kedarguesthouse@gmail.com",
            to,
            "Welcome in kedar guest house",
            htmlToSend
          );
          req.flash("username", save.firstname);
          req.flash("id", save._id);
          req.flash("checkin", moment(save.checkin).format("MM/DD/YYYY"));
          req.flash("checkout", moment(save.checkout).format("MM/DD/YYYY"));
          res.redirect("/book");
        });
      }
    });
  } else {
    res.redirect(404);
  }
});

router.get("/book", function(req, res, next) {
  res.render("booking", {
    username: req.flash("username"),
    id: req.flash("id"),
    checkin: req.flash("checkin"),
    checkout: req.flash("checkout")
  });
});

router.post("/subscriber-email", function(req, res, next) {
  // res.redirect("/");
  Subscriber.findOne({ email: req.body.subscriberEmail }, function(err, sub) {
    if (sub) {
      res.redirect("/");
    } else {
      var subscriber = new Subscriber();
      subscriber.email = req.body.subscriberEmail;
      subscriber.save(function(err, save) {
        if (err) return res.redirect("/404");
        res.redirect("/");
      });
    }
  });
});
router.get("/404", function(req, res, next) {
  res.render("404");
});
router.get("/writeareview", function(req, res, next) {
  res.render("main/writereview");
});
router.post("/writeareview", function(req, res, next) {
  var review = new Review();
  review.name = req.body.name;
  review.email = req.body.email;
  review.comment = req.body.comment;
  review.save(function(err, save) {
    if (err) return res.redirect("/404");
    mailer.sendEmail(
      "surajyee1212banti@gmail.com",
      "vk@kedarguesthouse.com",
      "New Review recieved",
      `New review was added by ${req.body.name}, <br> email: ${req.body.email}, <br> comment: ${req.body.comment}`
    );
    res.redirect("/");
  });
});
module.exports = router;
