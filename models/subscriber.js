var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var SubscriberSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, lowercase: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updateAt"
    }
  }
);
module.exports = mongoose.model("Subscriber", SubscriberSchema);
