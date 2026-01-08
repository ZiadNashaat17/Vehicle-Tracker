import { Schema, model } from "mongoose";

const chatSchema = new Schema(
  {
    userIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatType: { type: String, enum: ["Private", "Group"] },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    groupName: String,
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
    },
    toObject: {
      versionKey: false,
    },
  }
);

chatSchema.index({ userIds: 1, chatType: 1 });

chatSchema.pre(/^find/, function () {
  this.populate("userIds", "name email status profilePicture phoneNumber").populate("lastMessage");
});

const Chat = model("Chat", chatSchema);

export default Chat;
