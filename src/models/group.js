import mongoose, { Schema } from "mongoose";

const GroupSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", GroupSchema);

export const getGroups = (filter, pagination) => {
  if (pagination && Object.keys(pagination).length) {
    const { skip, limit } = pagination;
    if (skip !== undefined || limit !== undefined) {
      return Group.find(filter).skip(skip).limit(limit).exec();
    }
  }
  return Group.find(filter).exec();
};
export const getGroupById = (id) => Group.findOne({ _id: id });

export const createGroup = (values) =>
  new Group(values).save().then((group) => group.toObject());

export const updateGroup = async (filter, updatedData) =>
  await Group.findOneAndUpdate(filter, updatedData, { new: true }).then(
    (group) => group.toObject()
  );
export const deleteGroupById = async (id) =>
  await Group.deleteOne({ _id: id }).exec();
