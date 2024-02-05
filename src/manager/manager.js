import readline from 'readline';
import process, { stdin as input, stdout as output } from 'node:process';
import { Errors } from '../errors.js';
import { Controller } from '../controller/controller.js';
import { doGreeting } from './utils/doGreeting.js';
import { doBye } from './utils/doBye.js';
import { showErrorMsgOnExit } from './utils/showErrorMsgOnExit.js';
import { showErrorMsgOnInvalidInput } from './utils/showErrorMsgOnInvalidInput.js';
import { showErrorMsgOnOperationFailed } from './utils/showErrorMsgOnOperationFailed.js';
import { getInvitationText } from './utils/getInvitationText.js';

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
        if (e instanceof Errors) {
          showErrorMsgOnInvalidInput(e.message);
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
