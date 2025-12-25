import crypto from "node:crypto";
import { compare, hash } from "bcrypt";
import { model, Schema } from "mongoose";
import validator from "validator";

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		require: true,
		unique: true,
		lowercase: true,
		trim: true,
		validator: validator.isEmail,
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		select: false,
	},
	active: {
		type: Boolean,
		default: true,
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	profilePicture: String,
	passwordChangedAt: {
		type: Date,
		select: false,
	},
	passwordResetToken: String,
	passwordResetExpires: Date,
	isVerified: { type: Boolean, default: false },
	emailVerificationToken: String,
	emailTokenExpires: Date,
});

userSchema.pre("save", async function () {
	if (!this.isModified("password")) return;

	this.password = await hash(this.password, 12);
	this.passwordChangedAt = Date.now();
});

userSchema.pre("save", function () {
	if (!this.isModified("password") || this.isNew) return;

	this.passwordChangedAt = Date.now() - 1000;
});

userSchema.methods.isPasswordCorrect = async (candidatePassword, userPassword) =>
	await compare(candidatePassword, userPassword);

userSchema.methods.passwordChangedAfter = function (JWTtimstamp) {
	if (this.passwordChangedAt) {
		const changedAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

		return JWTtimstamp < changedAtTimestamp;
	}

	return false;
};

userSchema.methods.generateResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

userSchema.methods.generateVerificationToken = function () {
	const verificationToken = crypto.randomBytes(32).toString("hex");

	this.emailVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");

	this.emailTokenExpires = Date.now() + 10 * 60 * 1000;

	return verificationToken;
};

const User = model("User", userSchema);

export default User;
