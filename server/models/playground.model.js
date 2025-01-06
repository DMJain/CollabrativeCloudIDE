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
    },
    containerIP: {
      type: String,
    },
    hostPort: {
      type: Number,
      required: true,
    },
    envPort: {
      type: String,
      required: true,
    },
    inviteCode: {
      type: String,
      required: false,
    },
    runningStatus:{
      type: String,
      default: 'CLOSED',
      enum: ['OPEN', 'CLOSED']
    }
  },
  { timestamps: true }
);
const Playground = model("playground", playgroundSchema);
module.exports = Playground;
