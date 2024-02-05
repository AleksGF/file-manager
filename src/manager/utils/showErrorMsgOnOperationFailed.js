import { dictionary as dict } from '../../costants.js';

export const showErrorMsgOnOperationFailed = (arg) => {
  console.log(
    `${dict.ERROR_MSG_ON_OPERATION_FAILED}${arg ? ' (' + arg + ')' : ''}`
  );
};
