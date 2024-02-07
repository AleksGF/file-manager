import readline from 'readline';
import process, { stdin as input, stdout as output } from 'node:process';
import { AppError, InputError } from '../errors.js';
import { Controller } from '../controller/controller.js';
import { doGreeting } from './utils/doGreeting.mjs';
import { doBye } from './utils/doBye.mjs';
import { showErrorMsgOnExit } from './utils/showErrorMsgOnExit.mjs';
import { showErrorMsgOnInvalidInput } from './utils/showErrorMsgOnInvalidInput.mjs';
import { showErrorMsgOnOperationFailed } from './utils/showErrorMsgOnOperationFailed.mjs';
import { getInvitationText } from './utils/getInvitationText.mjs';

export const startFileManager = () => {
  const controller = new Controller();

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
      doBye(controller.state.username);
    } else {
      showErrorMsgOnExit();
    }

    process.exit(code);
  };

  process.on('SIGINT', () => {
    exit(0);
  });

  const ask = (q) => {
    ioInterface.question(q, async (answer) => {
      if (answer.includes('.exit')) {
        exit(0);
      }

      try {
        const [command, ...args] = answer.split(' ');

        if (
          command &&
          controller[command] &&
          typeof controller[command] === 'function'
        ) {
          await controller[command](...args);
        } else {
          showErrorMsgOnInvalidInput();
        }
      } catch (e) {
        if (e instanceof InputError) {
          showErrorMsgOnInvalidInput(e.message);
        } else if (e instanceof AppError) {
          showErrorMsgOnOperationFailed(e.message);
        } else {
          showErrorMsgOnOperationFailed();
        }
      }

      ask(getInvitationText(controller.state.pathObject));
    });
  };

  doGreeting(controller.state.username);

  ask(getInvitationText(controller.state.pathObject));
};
