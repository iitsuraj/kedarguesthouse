var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var BookingSchema = new Schema(
  {
    checkin: Date,
    checkout: Date,
    firstname: String,
    lastname: String,
    mobilenumber: String,
    email: String,
    room: { type: Schema.Types.ObjectId, ref: "Room" },
    paymentid: { type: String, unique: true },
    paymentstatus: String,
    payentreqid: String
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updateAt"
    }
  }
);
module.exports = mongoose.model("Booking", BookingSchema);
