import { model, Schema } from "mongoose";

const messagesSchema = new Schema(
	{
		message: {
			type: String,
			trim: true,
			required: true,
		},
		senderId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		receiverId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		chatId: {
			type: Schema.Types.ObjectId,
			ref: "Chat",
		},
		seen: {
			type: Boolean,
			default: false,
		},
		seenAt: Date,
		isEdited: { type: Boolean, default: false },
		editedAt: Date,
	},
	{
		timestamps: { createdAt: true },
	},
);

messagesSchema.index({ chatId: 1, seen: 1, senderId: 1 });

const Messages = model("Messages", messagesSchema);

export default Messages;
