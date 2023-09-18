import mongoose, { Schema } from "mongoose";

const TaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    formName: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

export const getTasks = (filter, pagination) => {
  if (pagination && Object.keys(pagination).length) {
    const { skip, limit } = pagination;
    if (skip !== undefined || limit !== undefined) {
      return Task.find(filter).skip(skip).limit(limit).exec();
    }
  }
  return Task.find(filter).exec();
};
export const getTaskById = (id) => Task.findOne({ id });

export const createTask = (values) =>
  new Task(values).save().then((task) => task.toObject());

export const updateTask = async (filter, updatedData) =>
  await Task.updateOne(filter, updatedData).exec();
export const deleteTaskById = async (filter) =>
  await Task.deleteOne(filter).exec();

export const deleteTasksByGroupId = async (groupId) => {
  try {
    const result = await Task.deleteMany({ groupId: groupId });
    return result;
  } catch (error) {
    throw error;
  }
};
