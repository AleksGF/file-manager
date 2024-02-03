import fsPromises from 'fs/promises';
import { argv } from 'node:process';
import { homedir as getHomedir } from 'os';
import path from 'path';
import { dictionary as dict } from '../manager/costants.js';

export const getUserName = () =>
  argv
    ?.slice(2)
    ?.filter((arg) => arg.startsWith('--username='))[0]
    ?.split('=')[1] ?? dict.ANONYMOUS_USER_NAME;

export const getState = () => {
  const username = getUserName();
  const homeDir = getHomedir();

  const pathObject = path.parse(homeDir);

  return {
    username,
    pathObject,
  };
};

export const getAbsolutePath = (src, basePath) =>
  path.isAbsolute(src) ? src : path.join(basePath, src);

export const isPathExists = async (path) => {
  try {
    await fsPromises.stat(path);

    return true;
  } catch (e) {
    return false;
  }
};

export const isPathAccessible = async (path) => {
  try {
    await fsPromises.access(path);

    return true;
  } catch (e) {
    return false;
  }
};

export const isDirectory = async (path) => {
  try {
    const stat = await fsPromises.stat(path);

    return stat.isDirectory();
  } catch (e) {
    return false;
  }
};

export const isFile = async (path) => {
  try {
    const stat = await fsPromises.stat(path);

    return stat.isFile();
  } catch (e) {
    return false;
  }
};

export const isValidFileName = (fileName) => /^[a-zA-Z0-9_.-]+$/.test(fileName);
