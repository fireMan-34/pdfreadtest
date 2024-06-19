import { argv, cwd, } from 'process';
import { writeFile, } from 'fs/promises';
import { PdfReader } from 'pdfreader';
import minimist from 'minimist';
import { join } from 'path';

class SetTimeOutTask {
  constructor(time) {
    this.ref = null;
    this.updateTime(time);
  }

  updateTime(time) {
    this.clearTimeout();
    this.time = typeof time === 'number' ? time : 1000;
  }

  setTask(fn) {
    this.clearTimeout();
    setTimeout(fn, this.time !== null ? this.time : 1000);
  }

  clearTimeout() {
    if (this.ref !== null) {
      clearTimeout(this.ref);
    }
  }
}

/**
 * 
 * @param {string} filePath
 * @returns {Promise<string>} 
 */
const readPDFContent = (filePath) => {
  return new Promise((resolve, reject) => {
    let content = '';
    const pdfreader = new PdfReader();
    const setTimeOutTask = new SetTimeOutTask(50);

    pdfreader.parseFileItems(filePath, (err, data) => {
      if (err) {
        reject(err);
        return;
      };
      if (data && data.text) {
        content += data.text
        setTimeOutTask.setTask(() => resolve(content));
      }
    });
  });
};

// readPDFContent('./加密.pdf').then(console.log);

const commandArgs = minimist(argv.slice(2));

const filePath = commandArgs.file;
/** log | text */
const format = commandArgs.format ?? 'log';

if (!filePath) {
  throw new Error('PdfReadTest Cli must include a file path, --file [filePath]')
};

readPDFContent(filePath).then((content) => {
  switch (format) {
    case 'log':
      console.log(content);
      break;
    case 'text':
      writeFile(join(cwd(), 'pdf.text'), content, { encoding: 'utf-8' });
      break;
  }
});