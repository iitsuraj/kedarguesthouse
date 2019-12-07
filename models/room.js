var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var RoomSchema = new Schema(
  {
    image: String,
    price: Number,
    type: String
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updateAt"
    }
  }
);
module.exports = mongoose.model("Room", RoomSchema);
