import path from 'path';
import { dictionary as dict } from '../../costants.mjs';

export const getInvitationText = (pathObject) =>
  `${dict.GET_CURRENT_DIR_TEXT(path.format(pathObject))}\n${
    dict.INVITATION_TEXT
  }`;
