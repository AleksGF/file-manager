import { dictionary as dict } from '../../costants.mjs';

export const doGreeting = (username) => {
  console.clear();
  console.log(dict.GET_GREETING_TEXT(username));
  console.log(dict.HELP_TEXT);
};
