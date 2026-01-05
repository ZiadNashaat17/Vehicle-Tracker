import { Schema, model } from "mongoose";

const messagesSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    mediaUrl: String, // This will store the fileUrl from Cloudinary
    fileName: String, // original filename
    messageType: {
      type: String,
      enum: ["text", "image", "video", "file", "audio"],
      default: "text",
    },
    fileSize: Number,
    mimeType: String,
    fileExtension: String,
    seen: {
      type: Boolean,
      default: false,
    },
    seenAt: Date,
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      versionKey: false,
    },
    toObject: {
      versionKey: false,
    },
  }
);

messagesSchema.index({ chatId: 1, seen: 1, senderId: 1 });
messagesSchema.index({ chatId: 1, createdAt: -1 }); // For pagination queries

const Message = model("Message", messagesSchema);

export default Message;
