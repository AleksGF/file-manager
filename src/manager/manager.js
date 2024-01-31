import path from 'path';
import readline from 'readline';
import process, { stdin as input, stdout as output } from 'node:process';
import {
  getState,
  doGreeting,
  doBye,
  showErrorMsgOnExit,
  getInvitationText,
} from './utils.js';

export const startFileManager = () => {
  const state = getState();

  const ioInterface = readline.createInterface({
    input,
    output,
  });

  if (process.platform === 'win32') {
    ioInterface.on('SIGINT', () => {
      process.emit('SIGINT');
    });
  }

  const exit = (code) => {
    ioInterface.close();

    if (code === 0) {
      doBye(state.username);
    } else {
      showErrorMsgOnExit();
    }

    process.exit(code);
  };

  process.on('SIGINT', () => {
    exit(0);
  });

  const ask = (q) => {
    ioInterface.question(q, (answer) => {
      if (answer === '.exit') {
        exit(0);
      }

      ask(q);
    });
  };

  doGreeting(state.username);

  ask(getInvitationText(state.pathObject));
};
