var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var InfoSchema = new Schema(
  {
    info: String,
    youtube: String,
    image: String
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updateAt"
    }
  }
);
module.exports = mongoose.model("Info", InfoSchema);
