import { Schema, model } from 'mongoose';
import validator from 'validator';
import { hash, compare } from 'bcrypt';

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    require: true,
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
    enum: ['user', 'admin'],
    default: 'user',
  },
  passwordChangedAt: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await hash(this.password, 12);
  this.passwordChangedAt = Date.now();

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword, userPassword) {
  return await compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTtimstamp) {
  if (this.passwordChangedAt) {
    const changedAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JWTtimstamp < changedAtTimestamp;
  }

  return false;
};

const User = model('User', userSchema);

export default User;
