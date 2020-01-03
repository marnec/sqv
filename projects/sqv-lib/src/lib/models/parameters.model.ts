import { Log } from './log.model';

interface Parameter {
  fontSize?: string;
  chunkSize?: number;
  spaceSize?: number;
  log?: string;
  separator?: string;
}

export class ParametersModel {

  params: Parameter =  {
    fontSize: '14px',
    chunkSize: 0,
    spaceSize: 1,
    log: 'none',
    separator: '-'
  };

  process(inp: Parameter) {

    if (inp === undefined) {
      Log.w(1, 'undefined parameters.');
      return;
    }

    /** check input fontSize */
    if (inp.fontSize !== undefined) {
      const fSize = inp.fontSize;
      const fNum = +fSize.substr(0, fSize.length - 2);
      const fUnit = fSize.substr(fSize.length - 2, 2);

      if (isNaN(fNum) || (fUnit !== 'px' && fUnit !== 'vw')) {
        Log.w(1, 'wrong fontSize format.');
      } else {
        this.params.fontSize = fSize;
      }
    } else {
      Log.w(2, 'fontSize not set.');
    }

    /** check input chunkSize */
    if (inp.chunkSize !== undefined) {

      const cSize = +inp.chunkSize;
      if (isNaN(cSize) || cSize < 0) {
        Log.w(1, 'wrong chunkSize format.');
      } else {
        this.params.chunkSize = cSize;
      }
    } else {
      Log.w(2, 'chunkSize not set.');
    }

    /** check input spaceSize */
    if (inp.spaceSize !== undefined) {

      const cSize = +inp.spaceSize;
      if (isNaN(cSize) || cSize < 0) {
        Log.w(1, 'wrong spaceSize format.');
      } else {
        this.params.spaceSize = cSize;
      }
    } else {
      Log.w(2, 'spaceSize not set.');
    }

    /** check log value */
    if (inp.log !== undefined) {

      switch (inp.log) {
        case 'none': {
          Log.s(0);
          break;
        }
        case 'error': {
          Log.s(1);
          break;
        }
        case 'warn': {
          Log.s(2);
          break;
        }
        case 'debug': {
          Log.s(3);
          break;
        }
        default:
          Log.w(1, 'unknown log level.');
      }
    } else {
      Log.w(2, 'log not set.');
    }

    /** check separator value */
    if (inp.separator) {
      if (typeof inp.separator !== 'string') {
        Log.w(1, 'wrong separator type.');
      } else {
        this.params.separator = inp.separator;
      }
    }
  }

  getFontSize() {
    return this.params.fontSize;
  }
  getChunkSize() {
    return this.params.chunkSize;
  }
  getSpaceSize() {
    return this.params.spaceSize;
  }
  getSeparator() {
    return this.params.separator;
  }
}
