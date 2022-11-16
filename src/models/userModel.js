const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: false,
      index: true,
      unique: true,
      sparse: true,
    },
    password: { type: String, required: false, minlength: 8 },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false, unique: true, sparse: true },
  },
  { timestamps: true, collection: "Users" }
);

module.exports = mongoose.model("user", userSchema);
