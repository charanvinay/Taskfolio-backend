import { Errors, Responses } from "../Responses/response";
import {
  createTask,
  deleteTaskById,
  getTasks,
  updateTask,
} from "../models/task";
import { StatusCodes, validatePayload } from "../services";
import { ServerException } from "../exceptions/exception";
import { CONSTANTS, LABELS } from "../services/constants";
import { getGroupById } from "../models/group";
const { PAGE, PAGE_SIZE } = CONSTANTS;

export const addTask = async (req, res) => {
  try {
    const { title, type, createdBy, groupId, formName, status, date } = req.body;
    const payload = { title, type, createdBy, groupId, formName, status, date };
    const { isValid, invalidKey } = validatePayload(payload);
    if (isValid) {
      const group = await getGroupById(groupId);
      if (group && group["_id"]) {
        const savedTask = await createTask(payload);
        if (savedTask) {
          res.status(StatusCodes.OK).json({
            status: true,
            message: Responses.task_created,
          });
        }
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `Group ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.kindly_provide} ${
          LABELS["TASK"][invalidKey] || ""
        }`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const editTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, createdBy, groupId, formName, status, date } = req.body;
    const payload = { title, type, createdBy, groupId, formName, status, date };
    const { isValid, invalidKey } = validatePayload(payload);
    if (isValid) {
      const group = await getGroupById(groupId);
      if (group && group["_id"]) {
        let filter = { _id: id, groupId };
        const tasks = await getTasks(filter);
        if (tasks && tasks?.length) {
          const task = await updateTask(filter, payload);
          if (task) {
            res.status(StatusCodes.OK).json({
              status: true,
              message: Responses.task_updated,
            });
          }
        } else {
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ status: false, message: `Task ${Responses.not_found}` });
        }
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `Group ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.kindly_provide} ${
          LABELS["TASK"][invalidKey] || ""
        }`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const deleteTask = async (req, res) => {
  const { id, groupId } = req.query;
  const { isValid, invalidKey } = validatePayload({ id, groupId });
  try {
    if (isValid) {
      const group = await getGroupById(groupId);
      console.log(group);
      if (group && group["_id"]) {
        let filter = { _id: id, groupId };
        const tasks = await getTasks(filter);
        if (tasks && tasks?.length) {
          const task = await deleteTaskById(filter);
          if (task) {
            res.status(StatusCodes.OK).json({
              status: true,
              message: Responses.task_deleted,
            });
          }
        } else {
          res
            .status(StatusCodes.NOT_FOUND)
            .json({ status: false, message: `Task ${Responses.not_found}` });
        }
      } else {
        res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: false, message: `Group ${Responses.not_found}` });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.kindly_provide} ${
          LABELS["TASK"][invalidKey] || ""
        }`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const getTask = async (req, res) => {
  let { title = "", groupId = "", ...keys } = req.query;
  if (Boolean(groupId)) {
    const page = parseInt(req.query["page"]) || PAGE;
    const pageSize = parseInt(req.query["pageSize"]) || PAGE_SIZE;
    const skip = (page - 1) * pageSize;
    const pagination = { skip, limit: pageSize };
    let validKeys = Object.keys(keys).reduce((acc, curr) => {
      if (keys[curr]) {
        acc[curr] = keys[curr];
      }
      return acc;
    }, {});
    let filter = {
      groupId,
      ...validKeys,
      title: { $regex: title, $options: "i" },
    };
    try {
      const tasks = await getTasks(filter, pagination);
      if (tasks) {
        res.status(StatusCodes.OK).json({
          status: true,
          data: tasks,
          totalCount: tasks.length,
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: `Task ${Responses.not_found}`,
        });
      }
    } catch (error) {
      return new ServerException(Errors.internal_error).get(res);
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: `${Responses.kindly_provide} group id of the task`,
    });
  }
};
export const getFormNames = async (req, res) => {
  let { groupId = "" } = req.query;
  if (Boolean(groupId)) {
    let filter = { groupId };
    try {
      const tasks = await getTasks(filter);
      if (tasks) {
        const formNamesSet = new Set();
        tasks.forEach((task) => {
          if (task.formName) {
            formNamesSet.add(task.formName);
          }
        });
        const uniqueFormNames = Array.from(formNamesSet);
        res.status(StatusCodes.OK).json({
          status: true,
          data: uniqueFormNames,
          totalCount: uniqueFormNames.length,
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: `Task ${Responses.not_found}`,
        });
      }
    } catch (error) {
      return new ServerException(Errors.internal_error).get(res);
    }
  } else {
    res.status(StatusCodes.BAD_REQUEST).json({
      status: false,
      message: `${Responses.kindly_provide} group id of the task`,
    });
  }
};
