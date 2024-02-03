import fs from 'fs';
import os from 'os';
import path from 'path';
import fsPromises from 'fs/promises';
import { pipeline } from 'stream/promises';
import { createHash } from 'crypto';
import { createBrotliCompress, createBrotliDecompress } from 'zlib';
import { AppError } from './appError.js';
import {
  getState,
  isDirectory,
  isFile,
  isPathExists,
  isPathAccessible,
  isValidFileName,
  getAbsolutePath,
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
    const destPathObject = path.parse(destPath);

    if (
      path.isAbsolute(destPath) &&
      destPathObject.root !== this.state.pathObject.root
    )
      throw new AppError('You can go to another root');

    const newPath = getAbsolutePath(
      destPath,
      path.format(this.state.pathObject)
    );

    if (!(await isPathExists(newPath)) || !(await isDirectory(newPath))) {
      throw new AppError('No such directory');
    }

    if (!(await isPathAccessible(newPath))) {
      throw new AppError('Your permission denied');
    }

    this._state.pathObject = path.parse(newPath);
  }

  async ls() {
    try {
      const fullList = await fsPromises.readdir(
        path.format(this.state.pathObject)
      );

      if (fullList.length === 0) {
        console.log('\x1b[32mDirectory is empty\x1b[0m');
      } else {
        const list = await Promise.all(
          fullList.map(async (name) => {
            const stat = await fsPromises.stat(
              path.join(path.format(this.state.pathObject), name)
            );

            return { Name: name, Type: stat.isDirectory() ? 'DIR' : 'file' };
          })
        );

        console.table([
          ...list
            .filter((item) => item.Type === 'DIR')
            .sort((a, b) => a.Name.localeCompare(b.Name)),
          ...list
            .filter((item) => item.Type === 'file')
            .sort((a, b) => a.Name.localeCompare(b.Name)),
        ]);
      }
    } catch (e) {
      throw new Error('Error while reading directory');
    }
  }

  async cat(filePath) {
    const newFilePath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    if (!(await isPathExists(newFilePath)) || !(await isFile(newFilePath))) {
      throw new AppError('No such file');
    }

    if (!(await isPathAccessible(newFilePath))) {
      throw new AppError('Your permission denied');
    }

    await new Promise((resolve) => {
      const readableStream = fs.createReadStream(newFilePath, 'utf8');

      readableStream.on('error', () => {
        throw new Error('Error while reading file');
      });

      readableStream.on('data', (chunk) => {
        console.log(chunk.toString());
      });

      readableStream.on('end', () => {
        resolve();
      });
    });
  }

  async add(fileName) {
    if (!isValidFileName(fileName)) {
      throw new AppError('Invalid file name');
    }

    const filePath = path.join(path.format(this.state.pathObject), fileName);

    if (await isPathExists(filePath)) {
      throw new AppError('File already exists');
    }

    try {
      await fsPromises.writeFile(filePath, '');
    } catch (e) {
      throw new Error('Error while creating file');
    }
  }

  async rn(src, newName) {
    const srcPath = getAbsolutePath(src, path.format(this.state.pathObject));

    if (!(await isPathExists(srcPath)) || !(await isFile(srcPath))) {
      throw new AppError('No such file');
    }

    if (!(await isPathAccessible(srcPath))) {
      throw new AppError('Your permission denied');
    }

    if (!isValidFileName(newName)) {
      throw new AppError('Invalid file name');
    }

    const newPath = path.join(path.dirname(srcPath), newName);

    if (await isPathExists(newPath)) {
      throw new AppError('File already exists');
    }

    try {
      await fsPromises.rename(srcPath, newPath);
    } catch (e) {
      throw new Error('Error while renaming file');
    }
  }

  async cp(src, destDir) {
    const srcPath = getAbsolutePath(src, path.format(this.state.pathObject));
    const destPath = getAbsolutePath(
      destDir,
      path.format(this.state.pathObject)
    );

    if (!(await isPathExists(srcPath)) || !(await isFile(srcPath))) {
      throw new AppError('No such file');
    }

    if (!(await isPathExists(destPath)) || !(await isDirectory(destPath))) {
      throw new AppError('No such directory');
    }

    if (
      !(await isPathAccessible(srcPath)) ||
      !(await isPathAccessible(destPath))
    ) {
      throw new AppError('Your permission denied');
    }

    if (destPath === path.dirname(srcPath)) {
      throw new AppError('Source and destination are the same');
    }

    const newPath = path.join(destPath, path.basename(srcPath));

    if (await isPathExists(newPath)) {
      throw new AppError('File already exists');
    }

    await new Promise((resolve) => {
      const readableStream = fs.createReadStream(srcPath);
      const writableStream = fs.createWriteStream(newPath);

      readableStream.on('error', () => {
        throw new Error('Error while copying file');
      });

      writableStream.on('error', () => {
        throw new Error('Error while copying file');
      });

      readableStream.on('data', (chunk) => {
        writableStream.write(chunk);
      });

      readableStream.on('end', () => {
        writableStream.end();
        resolve();
      });
    });
  }

  async mv(srcPath, destDir) {
    await this.cp(srcPath, destDir);
    await this.rm(srcPath);
  }

  async rm(filePath) {
    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    if (!(await isPathExists(srcPath)) || !(await isFile(srcPath))) {
      throw new AppError('No such file');
    }

    if (!(await isPathAccessible(srcPath))) {
      throw new AppError('Your permission denied');
    }

    try {
      await fsPromises.unlink(srcPath);
    } catch (e) {
      throw new Error('Error while deleting file');
    }
  }

  os(arg) {
    switch (arg) {
      case '--EOL':
        console.log(`System EOL: \x1b[34m${JSON.stringify(os.EOL)}\x1b[0m`);
        break;

      case '--cpus':
        const cpus = os.cpus();
        console.log(`CPUs amount: \x1b[34m${cpus.length}\x1b[0m`);
        console.table(cpus, ['model', 'speed']);
        break;

      case '--homedir':
        console.log(`System homedir: \x1b[34m${os.homedir()}\x1b[0m`);
        break;

      case '--username':
        console.log(
          `System username: \x1b[34m${os.userInfo().username}\x1b[0m`
        );
        break;

      case '--architecture':
        console.log(`System architecture: \x1b[34m${os.arch()}\x1b[0m`);
        break;

      default:
        throw new Error('Invalid argument');
    }
  }

  async hash(filePath) {
    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    if (!(await isPathExists(srcPath)) || !(await isFile(srcPath))) {
      throw new AppError('No such file');
    }

    if (!(await isPathAccessible(srcPath))) {
      throw new AppError('Your permission denied');
    }

    const hashSum = await new Promise((resolve) => {
      const readableStream = fs.createReadStream(srcPath);
      const hash = createHash('sha256');

      readableStream.on('error', () => {
        throw new Error('Error while reading file');
      });

      readableStream.on('data', (chunk) => {
        hash.update(chunk);
      });

      readableStream.on('end', () => {
        resolve(hash.digest('hex'));
      });
    });

    console.log(hashSum);
  }

  async compress(filePath, dest) {
    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    if (!(await isPathExists(srcPath)) || !(await isFile(srcPath))) {
      throw new AppError('No such file');
    }

    if (!(await isPathAccessible(srcPath))) {
      throw new AppError('Your permission denied');
    }

    const destPath = getAbsolutePath(dest, path.format(this.state.pathObject));

    if (
      !(await isPathExists(path.dirname(destPath))) ||
      !(await isDirectory(path.dirname(destPath)))
    ) {
      throw new AppError('No destination directory');
    }

    if (!(await isPathAccessible(path.dirname(destPath)))) {
      throw new AppError('Your permission denied');
    }

    // TODO add try and catch
    await new Promise(async (resolve) => {
      const br = createBrotliCompress();

      const srcHandler = await fsPromises.open(srcPath, 'r');
      const distHandler = await fsPromises.open(destPath, 'w');

      const readableStream = srcHandler.createReadStream();
      const writableStream = distHandler.createWriteStream();

      readableStream.on('error', () => {
        throw new Error('Error while reading file');
      });

      writableStream.on('error', () => {
        throw new Error('Error while writing file');
      });

      writableStream.on('finish', async () => {
        await srcHandler.close();
        await distHandler.close();
        await fsPromises.unlink(srcPath);
        resolve();
      });

      try {
        await pipeline(readableStream, br, writableStream);
      } catch (e) {
        throw new Error('Error while compressing file');
      }
    });
  }

  async decompress(filePath, dest) {
    const srcPath = getAbsolutePath(
      filePath,
      path.format(this.state.pathObject)
    );

    if (!(await isPathExists(srcPath)) || !(await isFile(srcPath))) {
      throw new AppError('No such file');
    }

    if (!(await isPathAccessible(srcPath))) {
      throw new AppError('Your permission denied');
    }

    const destPath = getAbsolutePath(dest, path.format(this.state.pathObject));

    if (
      !(await isPathExists(path.dirname(destPath))) ||
      !(await isDirectory(path.dirname(destPath)))
    ) {
      throw new AppError('No destination directory');
    }

    if (!(await isPathAccessible(path.dirname(destPath)))) {
      throw new AppError('Your permission denied');
    }

    await new Promise(async (resolve) => {
      const br = createBrotliDecompress();

      const srcHandler = await fsPromises.open(srcPath, 'r');
      const distHandler = await fsPromises.open(destPath, 'w');

      const readableStream = srcHandler.createReadStream();
      const writableStream = distHandler.createWriteStream();

      readableStream.on('error', () => {
        throw new Error('Error while reading file');
      });

      writableStream.on('error', () => {
        throw new Error('Error while writing file');
      });

      writableStream.on('finish', async () => {
        await srcHandler.close();
        await distHandler.close();
        await fsPromises.unlink(srcPath);
        resolve();
      });

      try {
        await pipeline(readableStream, br, writableStream);
      } catch (e) {
        throw new Error('Error while decompressing file');
      }
    });
  }
}
