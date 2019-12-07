var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FaqSchema = new Schema(
  {
    question: String,
    answer: { type: String, trim: true }
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updateAt"
    }
  }
);
module.exports = mongoose.model("Faq", FaqSchema);
