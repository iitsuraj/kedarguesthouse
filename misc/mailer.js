var nodemailer = require("nodemailer");
var config = require("../config/mail");
var smtpTransport = require("nodemailer-smtp-transport");
var transport = nodemailer.createTransport(
  smtpTransport({
    port: 2525,
    // secure: true, // true for 465, false for other ports
    service: config.service,
    auth: {
      user: config.mailUserName, //config.mailUserName,
      pass: config.mailPassword //config.mailPassword,
    },
    tls: {
      rejectUnauthorized: false
    }
  })
);
module.exports = {
  sendEmail(from, to, subject, html) {
    return new Promise(function(resolve, reject) {
      transport.sendMail({ from, to, subject, html }, function(err, info) {
        if (err) reject(err);
        resolve(info);
      });
    });
  }
};
