var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var ReviewSchema = new Schema(
  {
    name: String,
    email: { type: String, trim: true, unique: true },
    comment: String,
    home: { type: Boolean, default: false }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updateAt"
    }
  }
);
module.exports = mongoose.model("Review", ReviewSchema);
