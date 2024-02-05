import { dictionary as dict } from '../../costants.mjs';

export const showErrorMsgOnInvalidInput = (msg) => {
  console.log(
    `${dict.ERROR_MSG_ON_INVALID_INPUT} ${msg ? ' (' + msg + ')' : ''}`
  );
};
