export const dictionary = {
  ANONYMOUS_USER_NAME: 'Anonymous',
  HELP_TEXT:
    '\x1b[90mType ".exit" or press "CTRL" + "C" to exit from File Manager\x1b[0m\n',
  INVITATION_TEXT: 'Enter your command: ',
  ERROR_MSG_ON_EXIT: '\n\x1b[101m\x1b[97mSomething went wrong!..\x1b[0m\n',
  ERROR_MSG_ON_INVALID_INPUT: '\x1b[91mInvalid input\x1b[0m',
  ERROR_MSG_ON_OPERATION_FAILED: '\x1b[91mOperation failed\x1b[0m',
  GET_GREETING_TEXT: (username) =>
    `\x1b[94mWelcome to the File Manager, ${username}!\x1b[0m`,
  GET_BYE_TEXT: (username) =>
    `\x1b[91m\n\nThank you for using File Manager, ${username}, goodbye!\n\x1b[0m`,
  GET_CURRENT_DIR_TEXT: (dir) => `\nYou are currently in \x1b[34m${dir}\x1b[0m`,
};
