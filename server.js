var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var ejs = require("ejs");
var engine = require("ejs-mate");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var flash = require("express-flash");
var MongoStore = require("connect-mongo")(session);
var passport = require("passport");
var secret = require("./config/secret");
var passportConf = require("./config/passport");
var csurf = require("csurf");
var compression = require("compression");
var helmet = require("helmet");
var Info = require("./models/info");
var csrfMiddleware = csurf({
  cookie: true
});

mongoose
  .connect(secret.database, { useNewUrlParser: true })
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });
var app = express();

function wwwRedirect(req, res, next) {
  if (req.headers.host.slice(0, 4) === "www.") {
    var newHost = req.headers.host.slice(4);
    return res.redirect(301, req.protocol + "://" + newHost + req.originalUrl);
  }
  next();
}

app.set("trust proxy", true);
app.use(wwwRedirect);

//middleware
app.use(
  compression({
    filter: function(req, res) {
      return true;
    }
  })
);
var oneYear = 1 * 365 * 24 * 60 * 60 * 1000;
app.use(express.static(__dirname + "/public", { maxAge: oneYear }));
app.use(express.static(__dirname + "/uploads", { maxAge: oneYear }));

app.use("/uploads", express.static("uploads"));
app.use(helmet());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: secret.secretKey,
    store: new MongoStore({ url: secret.database, autoReconnect: true })
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  Info.findOne({})
    .sort({ createdAt: -1 })
    .exec(function(err, info) {
      if (err) return next(err);
      res.locals.info = info;
      next();
    });
});
app.engine("ejs", engine);

app.set("view engine", "ejs");
app.set("view cache", true);

// app.use(csrfMiddleware);

// routes
var main = require("./routes/main");
app.use(main);
var panel = require("./routes/panel");
app.use("/panel", passportConf.isAuthenticated, panel);
var account = require("./routes/account");
app.use("/", account);
app.get("*", function(req, res) {
  res.redirect("/404");
});

app.listen(process.env.PORT || 3000, function(err) {
  if (err) throw err;
  console.log("server is running on port " + 3000);
});
