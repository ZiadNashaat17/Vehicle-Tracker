import { model, Schema } from "mongoose";
import AppError from "../util/appError.js";

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
			ref: "Messages",
		},
		groupAdmin: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		groupName: String,
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

chatSchema.index({ userIds: 1 });

const Chat = model("Chat", chatSchema);

export default Chat;
