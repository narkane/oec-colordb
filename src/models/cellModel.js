const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let cellData = new Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  color: {
    type: String,
  },
});

let cell = new Schema(
  {
    // all cells are indexed by an array in [x,y] using absolute cell positions
    location: [
      {
        type: Number,
        require: true,
      },
    ],
    cellData: cellData,
  },
  { timestamps: true, collection: "ColorMapRezOf2" }
);

module.exports = mongoose.model("colormap", cell);
