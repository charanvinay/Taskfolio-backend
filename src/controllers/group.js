import mongoose from "mongoose";
import { Errors, Responses } from "../Responses/response";
import { ServerException } from "../exceptions/exception";
import {
  createGroup,
  deleteGroupById,
  getGroupById,
  getGroups,
  updateGroup,
} from "../models/group";
import { deleteTasksByGroupId } from "../models/task";
import { getUserById } from "../models/user";
import { StatusCodes, validatePayload } from "../services";
import { CONSTANTS, LABELS } from "../services/constants";
const { PAGE, PAGE_SIZE } = CONSTANTS;

export const addGroup = async (req, res) => {
  try {
    const { title, createdBy, members } = req.body;
    const payload = { title, createdBy, members };
    const { isValid, invalidKey } = validatePayload(payload);
    if (isValid) {
      const savedGroup = await createGroup(payload);
      if (savedGroup) {
        res.status(StatusCodes.OK).json({
          status: true,
          message: Responses.group_created,
        });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.kindly_provide} ${
          LABELS["GROUP"][invalidKey] || ""
        }`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const editGroup = async (req, res) => {
  const { id } = req.params;
  const { title = "", members = [] } = req.body;
  try {
    let filter = { _id: id };
    const group = await getGroupById(id);
    if (group && group["_id"]) {
      let payload = {};
      if (title) {
        payload["title"] = title;
      }
      if (members && members.length) {
        const uniqueMembers = members.filter(
          (member) => !group.members.includes(member)
        );
        payload["members"] = [...group.members, ...uniqueMembers];
      }
      const resp = await updateGroup(filter, payload);
      if (resp) {
        res.status(StatusCodes.OK).json({
          status: true,
          message: Responses.group_updated,
        });
      }
    } else {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: false, message: `Group ${Responses.not_found}` });
    }
  } catch (error) {
    console.log(error);
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  const { isValid, invalidKey } = validatePayload(id);
  try {
    if (isValid) {
      const groups = await getGroupById(id);
      if (groups && groups["_id"]) {
        await deleteTasksByGroupId(id);
        const group = await deleteGroupById(id);
        if (group) {
          res.status(StatusCodes.OK).json({
            status: true,
            message: Responses.group_deleted,
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
          LABELS["GROUP"][invalidKey] || ""
        }`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const getGroup = async (req, res) => {
  try {
    let { title = "", uid = "" } = req.query;
    const page = parseInt(req.query["page"]) || PAGE;
    const pageSize = parseInt(req.query["pageSize"]) || PAGE_SIZE;
    const skip = (page - 1) * pageSize;
    const pagination = { skip, limit: pageSize };
    let filter = { title: { $regex: title, $options: "i" } };
    if (uid) {
      filter["members"] = uid;
    }
    const groups = await getGroups(filter, pagination);
    if (groups) {
      res.status(StatusCodes.OK).json({
        status: true,
        data: groups,
        totalCount: groups.length,
      });
    } else {
      res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: `Group ${Responses.not_found}`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const getMembers = async (req, res) => {
  try {
    let { id } = req.params;
    if (id) {
      const group = await getGroupById(id);
      if (group) {
        const memberData = await Promise.all(
          group.members.map(async (member) => {
            let { _id } = member;
            const user = await getUserById(_id);
            if (user) {
              let { fullName, email } = user;
              return {
                _id,
                fullName,
                email,
              };
            }
          })
        );
        res.status(StatusCodes.OK).json({
          status: true,
          data: memberData,
        });
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: `Group ${Responses.not_found}`,
        });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.kindly_provide} group id`,
      });
    }
  } catch (error) {
    return new ServerException(Errors.internal_error).get(res);
  }
};
export const leaveGroup = async (req, res) => {
  try {
    let { id, uid } = req.params;
    let filter = { _id: id };
    if (id && uid) {
      const group = await getGroupById(id);
      console.log(group, uid);
      if (group) {
        let payload = {};
        const uidObjectId = new mongoose.Types.ObjectId(uid);
        // Filter out the member with the specified uid
        payload["members"] = group.members.filter((member) => member.toString() !== uidObjectId.toString());
        console.log(payload);
        const resp = await updateGroup(filter, payload);
        if (resp) {
          res.status(StatusCodes.OK).json({
            status: true,
            message: Responses.group_leaved,
          });
        }
      } else {
        res.status(StatusCodes.NOT_FOUND).json({
          status: false,
          message: `Group ${Responses.not_found}`,
        });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        status: false,
        message: `${Responses.kindly_provide} group id along with user id`,
      });
    }
  } catch (error) {
    console.log(error);
    return new ServerException(Errors.internal_error).get(res);
  }
};
