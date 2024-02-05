import fsPromises from 'fs/promises';
import { argv } from 'node:process';
import { homedir as getHomedir } from 'os';
import path from 'path';
import { pipeline } from 'stream/promises';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { dictionary as dict } from '../costants.mjs';

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

const isPathAccessible = async (path) => {
  try {
    await fsPromises.access(path);

    return true;
  } catch (e) {
    return false;
  }
};

const isDirectory = async (path) => {
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

export const isValidFileName = (fileName) =>
  /^[a-zA-Z0-9_.-]{3,255}$/.test(fileName);

export const dirCheckError = async (dirPath) => {
  if (!(await isPathExists(dirPath)) || !(await isDirectory(dirPath))) {
    return dict.NO_DIRECTORY;
  }

  if (!(await isPathAccessible(dirPath))) {
    return dict.PERMISSION_DENIED;
  }

  return null;
};

export const fileCheckError = async (filePath) => {
  if (!(await isPathExists(filePath)) || !(await isFile(filePath))) {
    return dict.NO_FILE;
  }

  if (!(await isPathAccessible(filePath))) {
    return dict.PERMISSION_DENIED;
  }

  return null;
};

export const getPromiseForBrotli = (srcPath, destPath, action) =>
  new Promise(async (resolve, reject) => {
    try {
      const br =
        action === 'decompress'
          ? createBrotliDecompress()
          : createBrotliCompress();

      const srcHandler = await fsPromises.open(srcPath, 'r');
      const distHandler = await fsPromises.open(destPath, 'w');

      const readableStream = srcHandler.createReadStream();
      const writableStream = distHandler.createWriteStream();

      writableStream.on('finish', async () => {
        await srcHandler.close();
        await distHandler.close();
        await fsPromises.unlink(srcPath);
        resolve();
      });

      await pipeline(readableStream, br, writableStream);
    } catch (e) {
      reject(e);
    }
  });
