import path from 'path';
import { dictionary as dict } from '../costants.js';

export const doGreeting = (username) => {
  console.clear();
  console.log(dict.GET_GREETING_TEXT(username));
  console.log(dict.HELP_TEXT);
};

export const doBye = (username) => {
  console.log(dict.GET_BYE_TEXT(username));
};

export const showErrorMsgOnExit = () => {
  console.log(dict.ERROR_MSG_ON_EXIT);
};

export const showErrorMsgOnInvalidInput = (msg) => {
  console.log(
    `${dict.ERROR_MSG_ON_INVALID_INPUT} ${msg ? ' (' + msg + ')' : ''}`
  );
};

export const showErrorMsgOnOperationFailed = () => {
  console.log(dict.ERROR_MSG_ON_OPERATION_FAILED);
};

export const getInvitationText = (pathObject) =>
  `${dict.GET_CURRENT_DIR_TEXT(path.format(pathObject))}\n${
    dict.INVITATION_TEXT
  }`;
