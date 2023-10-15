
export const convertDaysToMS = (days) => days * 86400000;
export const CONSTANTS = {
  ACCESS_TOKEN_EXP: "3d",
  ACCESS_TOKEN_EXP_IN_MS: convertDaysToMS(1),
  REFRESH_TOKEN_EXP: "7d",
  RESET_TOKEN_EXP: "5m",
  REFRESH_TOKEN_EXP_IN_MS: convertDaysToMS(7),
  PASSWORD_HASH_ROUNDS: 10,
  ACCESS_TOKEN: "access_token",
  RESET_TOKEN: "reset_token",
  REFRESH_TOKEN: "refresh_token",
  PAGE: 1,
  PAGE_SIZE: 20
};

export const LABELS={
  TASK: {
    id: "task id",
    title: "task title",
    type: "task type",
    createdBy: "created by user id",
    groupId: "group id",
    formName: "form name",
    assignedTo: "assigned to",
    status: "task status",
    date: "task date",
  },
  GROUP: {
    id: "group id",
    title: "group title",
    createdBy: "created by user id",
    members: "group members"
  }
}
