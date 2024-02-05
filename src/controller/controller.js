import fs from 'fs';
import os from 'os';
import path from 'path';
import fsPromises from 'fs/promises';
import { createHash } from 'crypto';
import { dictionary as dict } from '../costants.js';
import { AppError, InputError } from '../errors.js';
import {
  getState,
  isPathExists,
  isValidFileName,
  getAbsolutePath,
  dirCheckError,
  fileCheckError,
  getPromiseForBrotli,
} from './utils.js';

export class Controller {
  _state;

  constructor() {
    this._state = getState();
  }

  get state() {
    return this._state;
  }

  up() {
    const currentPath = path.format(this.state.pathObject);
    const newPath = path.join(currentPath, '..');

    this._state.pathObject = path.parse(newPath);
  }

  async cd(destPath) {
    if (!destPath) throw new InputError(dict.ERROR_INVALID_ARG);

    const destPathObject = path.parse(destPath);

    if (
      path.isAbsolute(destPath) &&
      destPathObject.root !== this.state.pathObject.root
    )
      throw new AppError(dict.ERROR_CHANGE_ROOT);

    const newPath = getAbsolutePath(
      destPath,
      path.format(this.state.pathObject)
    );

    const dirCheckResult = await dirCheckError(newPath);
    if (dirCheckResult) throw new AppError(dirCheckResult);

    this._state.pathObject = path.parse(newPath);
  }

  async ls() {
    try {
      const fullList = await fsPromises.readdir(
        path.format(this.state.pathObject)
      );

      if (fullList.length === 0) {
        console.log(dict.DIRECTORY_IS_EMPTY);
      } else {
        const list = await Promise.all(
          fullList.map(async (name) => {
            const stat = await fsPromises.stat(
              path.join(path.format(this.state.pathObject), name)
            );

            return {
              Name: name,
              Type: stat.isDirectory() ? dict.DIR : dict.FILE,
            };
          })
        );

        console.table([
          ...list
            .filter((item) => item.Type === dict.DIR)
            .sort((a, b) => a.Name.localeCompare(b.Name)),
          ...list
            .filter((item) => item.Type === dict.FILE)
            .sort((a, b) => a.Name.localeCompare(b.Name)),
        ]);
      }
    } catch (e) {
      throw new AppError(dict.ERROR_READ_DIR);
    }
  }

  async cat(filePath) {
    if (!filePath) throw new InputError(dict.ERROR_INVALID_ARG);

    const newFilePath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    const fileCheckResult = await fileCheckError(newFilePath);
    if (fileCheckResult) throw new AppError(fileCheckResult);

    try {
      await new Promise((resolve, reject) => {
        try {
          const readableStream = fs.createReadStream(newFilePath, 'utf8');

          readableStream.on('error', () => {
            throw new AppError(dict.ERROR_READ_FILE);
          });

          readableStream.on('data', (chunk) => {
            console.log(chunk.toString());
          });

          readableStream.on('end', () => {
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      throw new AppError(dict.ERROR_READ_FILE);
    }
  }

  async add(fileName) {
    if (!fileName) throw new InputError(dict.ERROR_INVALID_ARG);

    if (!isValidFileName(fileName)) {
      throw new AppError(dict.INVALID_FILE_NAME);
    }

    const filePath = path.join(path.format(this.state.pathObject), fileName);

    if (await isPathExists(filePath)) {
      throw new AppError(dict.FILE_EXISTS);
    }

    try {
      await fsPromises.writeFile(filePath, '');
    } catch (e) {
      throw new AppError(dict.ERROR_CREATE_FILE);
    }
  }

  async rn(src, newName) {
    if (!src || !newName) throw new InputError(dict.ERROR_INVALID_ARG);

    const srcPath = getAbsolutePath(src, path.format(this.state.pathObject));

    const fileCheckResult = await fileCheckError(srcPath);
    if (fileCheckResult) throw new AppError(fileCheckResult);

    if (!isValidFileName(newName)) {
      throw new AppError(dict.INVALID_FILE_NAME);
    }

    const newPath = path.join(path.dirname(srcPath), newName);

    if (await isPathExists(newPath)) {
      throw new AppError(dict.FILE_EXISTS);
    }

    try {
      await fsPromises.rename(srcPath, newPath);
    } catch (e) {
      throw new AppError(dict.ERROR_RENAME_FILE);
    }
  }

  async cp(src, destDir) {
    if (!src || !destDir) throw new InputError(dict.ERROR_INVALID_ARG);

    const srcPath = getAbsolutePath(src, path.format(this.state.pathObject));
    const destPath = getAbsolutePath(
      destDir,
      path.format(this.state.pathObject)
    );

    const fileCheckResult = await fileCheckError(srcPath);
    if (fileCheckResult) throw new AppError(fileCheckResult);

    const dirCheckResult = await dirCheckError(destPath);
    if (dirCheckResult) throw new AppError(dirCheckResult);

    if (destPath === path.dirname(srcPath)) {
      throw new InputError(dict.ERROR_NOT_UNIQUE);
    }

    const newPath = path.join(destPath, path.basename(srcPath));

    if (await isPathExists(newPath)) {
      throw new AppError(dict.FILE_EXISTS);
    }

    try {
      await new Promise((resolve, reject) => {
        try {
          const readableStream = fs.createReadStream(srcPath);
          const writableStream = fs.createWriteStream(newPath);

          readableStream.on('error', () => {
            throw new AppError(dict.ERROR_COPY_FILE);
          });

          writableStream.on('error', () => {
            throw new AppError(dict.ERROR_COPY_FILE);
          });

          readableStream.on('data', (chunk) => {
            writableStream.write(chunk);
          });

          readableStream.on('end', () => {
            writableStream.end();
            resolve();
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      throw new AppError(dict.ERROR_COPY_FILE);
    }
  }

  async mv(srcPath, destDir) {
    await this.cp(srcPath, destDir);
    await this.rm(srcPath);
  }

  async rm(filePath) {
    if (!filePath) throw new InputError(dict.ERROR_INVALID_ARG);

    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    const fileCheckResult = await fileCheckError(srcPath);
    if (fileCheckResult) throw new AppError(fileCheckResult);

    try {
      await fsPromises.unlink(srcPath);
    } catch (e) {
      throw new AppError(dict.ERROR_DELETE_FILE);
    }
  }

  os(arg) {
    if (!arg) throw new InputError(dict.ERROR_INVALID_ARG);

    switch (arg) {
      case '--EOL':
        console.log(dict.GET_OS_EOL_TEXT(os.EOL));
        break;

      case '--cpus':
        const cpus = os.cpus();
        console.log(dict.GET_CPU_AMOUNT_TEXT(cpus.length));
        console.table(cpus, ['model', 'speed']);
        break;

      case '--homedir':
        console.log(dict.GET_OS_HOMEDIR_TEXT(os.homedir()));
        break;

      case '--username':
        console.log(dict.GET_USERNAME_TEXT(os.userInfo().username));
        break;

      case '--architecture':
        console.log(dict.GET_OS_ARCH_TEXT(os.arch()));
        break;

      default:
        throw new InputError(dict.ERROR_INVALID_ARG);
    }
  }

  async hash(filePath) {
    if (!filePath) throw new InputError(dict.ERROR_INVALID_ARG);

    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    const fileCheckResult = await fileCheckError(srcPath);
    if (fileCheckResult) throw new AppError(fileCheckResult);

    try {
      const hashSum = await new Promise((resolve, reject) => {
        try {
          const readableStream = fs.createReadStream(srcPath);
          const hash = createHash('sha256');

          readableStream.on('error', () => {
            throw new AppError(dict.ERROR_READ_FILE);
          });

          readableStream.on('data', (chunk) => {
            hash.update(chunk);
          });

          readableStream.on('end', () => {
            resolve(hash.digest('hex'));
          });
        } catch (e) {
          reject(e);
        }
      });

      console.log(hashSum);
    } catch (e) {
      throw new AppError(dict.ERROR_READ_FILE);
    }
  }

  async compress(filePath, dest) {
    if (!filePath || !dest) throw new InputError(dict.ERROR_INVALID_ARG);

    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    const fileCheckResult = await fileCheckError(srcPath);
    if (fileCheckResult) throw new AppError(fileCheckResult);

    const destPath = getAbsolutePath(dest, path.format(this.state.pathObject));

    if (await isPathExists(destPath)) {
      throw new AppError(dict.FILE_EXISTS);
    }

    const dirCheckResult = await dirCheckError(path.dirname(destPath));
    if (dirCheckResult) throw new AppError(dirCheckResult);

    try {
      await getPromiseForBrotli(srcPath, destPath, 'compress');
    } catch (e) {
      throw new AppError(dict.ERROR_COMPRESS_FILE);
    }
  }

  async decompress(filePath, dest) {
    if (!filePath || !dest) throw new InputError(dict.ERROR_INVALID_ARG);

    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    const fileCheckResult = await fileCheckError(srcPath);
    if (fileCheckResult) throw new AppError(fileCheckResult);

    const destPath = getAbsolutePath(dest, path.format(this.state.pathObject));

    if (await isPathExists(destPath)) {
      throw new AppError(dict.FILE_EXISTS);
    }

    const dirCheckResult = await dirCheckError(path.dirname(destPath));
    if (dirCheckResult) throw new AppError(dirCheckResult);

    try {
      await getPromiseForBrotli(srcPath, destPath, 'decompress');
    } catch (e) {
      throw new AppError(dict.ERROR_DECOMPRESS_FILE);
    }
  }
}
