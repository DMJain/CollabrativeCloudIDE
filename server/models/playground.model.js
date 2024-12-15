const { Schema, model } = require("mongoose");

const playgroundSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      min: 2,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    image: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);
const Playground = model("playground", playgroundSchema);
module.exports = Playground;
