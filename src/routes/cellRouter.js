const router = require("express").Router();
const CellRezOf2 = require("../models/cellModel");
const User = require("../models/userModel");
const auth = require("../middleware/auth");

const ObjectId = require("mongoose").Types.ObjectId;

router.post("/colorCell", auth, async (req, res) => {
  try {
    console.log(req.body);
    // !! check for uniqueness and throw error
    const location = req.body.location;
    const color = req.body.color;

    console.log(req.user);
    console.log(location, color);

    if (!location || !color) {
      return res
        .status(400)
        .json({ msg: "Not all required fields have been entered." });
    }

    // if cell exists replace it
    const existingLocation = await CellRezOf2.findOneAndDelete({
      location: location,
    });
    if (existingLocation) {
      // return res
      //     .status(400)
      //     .json({ msg: "A cell at this location already exists."})
      console.log("existing cell at desired location removed");
    }

    const newCell = new CellRezOf2({
      location: req.body.location,
      cellData: {
        owner: req.user,
        color: req.body.color,
      },
    });
    const savedCell = await newCell.save();
    res.json(savedCell);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.post("/inspectCell", auth, async (req, res) => {
  try {
    const location = req.body;

    console.log(location);

    if (!location) {
      return res.status(400).json({ msg: "No location specified." });
    }

    cellResponse = await CellRezOf2.findOne({
      $and: [
        { "location.0": { $eq: location[0] } },
        { "location.1": { $eq: location[1] } },
      ],
    });
    try {
      const ownerLookup = await User.findOne({
        _id: new ObjectId(cellResponse.cellData.owner),
      });
      res.json({
        location: cellResponse.location,
        cellData: {
          owner: ownerLookup.username,
          color: cellResponse.cellData.color,
        },
      });
    } catch {
      res.json(cellResponse);
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

router.post("/fetchRegion", async (req, res) => {
  try {
    let cellResponse = [];
    // check if desired region contains the prime meridian "evil line"
    if (req.body.firstCell.x > req.body.lastCell.x) {
      // query DB for all cells in desired region
      cellResponse = await CellRezOf2.find({
        $or: [
          {
            $and: [
              { "location.0": { $gte: req.body.firstCell.x } },
              { "location.0": { $lte: 840 } },
              { "location.1": { $gte: req.body.firstCell.y } },
              { "location.1": { $lte: req.body.lastCell.y } },
              { updatedAt: { $gte: req.body.lastFetchRegionTime } },
            ],
          },
          {
            $and: [
              { "location.0": { $gte: 0 } },
              { "location.0": { $lte: req.body.lastCell.x } },
              { "location.1": { $gte: req.body.firstCell.y } },
              { "location.1": { $lte: req.body.lastCell.y } },
              { updatedAt: { $gte: req.body.lastFetchRegionTime } },
            ],
          },
        ],
      });
      // then append remaining cells to right of meridian
      //   cellResponse = cellResponse.concat(
      //     await CellRezOf2.find({
      //       $and: [
      //         { "location.0": { $gte: 0 } },
      //         { "location.0": { $lte: req.body.lastCell.x } },
      //         { "location.1": { $gte: req.body.firstCell.y } },
      //         { "location.1": { $lte: req.body.lastCell.y } },
      //       ],
      //     })
      //   );
    } else {
      // query DB for ALL cells in desired region
      cellResponse = await CellRezOf2.find({
        $and: [
          { "location.0": { $gte: req.body.firstCell.x } },
          { "location.0": { $lte: req.body.lastCell.x } },
          { "location.1": { $gte: req.body.firstCell.y } },
          { "location.1": { $lte: req.body.lastCell.y } },
          { updatedAt: { $gte: req.body.lastFetchRegionTime } },
        ],
      });
    }
    // console.log(JSON.stringify(res));

    res.json(cellResponse);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
});

module.exports = router;
