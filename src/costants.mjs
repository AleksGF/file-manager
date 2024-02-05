export const dictionary = {
  ANONYMOUS_USER_NAME: 'Anonymous',
  HELP_TEXT:
    '\x1b[90mType ".exit" or press "CTRL" + "C" to exit from File Manager\x1b[0m\n',
  INVITATION_TEXT: 'Enter your command: ',
  ERROR_MSG_ON_EXIT: '\n\x1b[101m\x1b[97mSomething went wrong!..\x1b[0m\n',
  ERROR_MSG_ON_INVALID_INPUT: '\x1b[91mInvalid input\x1b[0m',
  ERROR_MSG_ON_OPERATION_FAILED: '\x1b[91mOperation failed\x1b[0m',
  ERROR_INVALID_ARG: 'Invalid argument',
  NO_DIRECTORY: 'No such directory',
  NO_FILE: 'No such file',
  FILE_EXISTS: 'File already exists',
  INVALID_FILE_NAME: 'Invalid file name',
  PERMISSION_DENIED: 'Your permission denied',
  DIRECTORY_IS_EMPTY: '\x1b[32mDirectory is empty\x1b[0m',
  DIR: 'DIR',
  FILE: 'file',
  ERROR_CHANGE_ROOT: 'You can not go to another root',
  ERROR_READ_DIR: 'Error while reading directory',
  ERROR_READ_FILE: 'Error while reading file',
  ERROR_CREATE_FILE: 'Error while creating file',
  ERROR_RENAME_FILE: 'Error while renaming file',
  ERROR_COPY_FILE: 'Error while copying file',
  ERROR_DELETE_FILE: 'Error while deleting file',
  ERROR_COMPRESS_FILE: 'Error while compressing file',
  ERROR_DECOMPRESS_FILE: 'Error while decompressing file',
  ERROR_NOT_UNIQUE: 'Source and destination are the same',
  GET_GREETING_TEXT: (username) =>
    `\x1b[94mWelcome to the File Manager, ${username}!\x1b[0m`,
  GET_BYE_TEXT: (username) =>
    `\x1b[91m\n\nThank you for using File Manager, ${username}, goodbye!\n\x1b[0m`,
  GET_CURRENT_DIR_TEXT: (dir) => `\nYou are currently in \x1b[34m${dir}\x1b[0m`,
  GET_OS_EOL_TEXT: (arg) => `System EOL: \x1b[34m${JSON.stringify(arg)}\x1b[0m`,
  GET_CPU_AMOUNT_TEXT: (arg) => `CPUs amount: \x1b[34m${arg}\x1b[0m`,
  GET_OS_HOMEDIR_TEXT: (arg) => `System homedir: \x1b[34m${arg}\x1b[0m`,
  GET_USERNAME_TEXT: (arg) => `System username: \x1b[34m${arg}\x1b[0m`,
  GET_OS_ARCH_TEXT: (arg) => `System architecture: \x1b[34m${arg}\x1b[0m`,
};