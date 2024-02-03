import readline from 'readline';
import process, { stdin as input, stdout as output } from 'node:process';
import { Controller } from '../controller/controller.js';
import {
  doGreeting,
  doBye,
  showErrorMsgOnExit,
  getInvitationText,
  showErrorMsgOnInvalidInput,
  showErrorMsgOnOperationFailed,
} from './utils.js';

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
        // TODO: show 'Invalid input' with args errors
        console.log(e.code);
        console.log(e.message);
        showErrorMsgOnOperationFailed();
      }

      ask(getInvitationText(controller.state.pathObject));
    });
  };

  doGreeting(controller.state.username);

  ask(getInvitationText(controller.state.pathObject));
};
