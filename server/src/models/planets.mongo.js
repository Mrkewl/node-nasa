const mongoose = require("mongoose");
const planetSchema = new mongoose.Schema({
    kepler_name: {
    type: String,
    required: true,
  },
});

const Planet = mongoose.model("Planet", planetSchema);
module.exports = Planet;
