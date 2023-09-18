import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export const getUsers = () => User.find();
export const getUserByEmail = (email) => User.findOne({ email });
export const getUserById = (id) => User.findOne({ _id: id });

export const createUser = (values) =>
  new User(values).save().then((user) => user.toObject());

export default User;
