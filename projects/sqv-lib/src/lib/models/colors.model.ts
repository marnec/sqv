import {Log} from './log.model';
import {RowsModel} from './rows.model';

/** Input Colors */
interface InpColors {
  [key: string]: Array<InpColor>;
}

interface InpColor {
  row: string;
  color: string;
  target?: string;
}

/** Output Colors */
// E.g.: 'coloring': {rowNum: { positions:[{start, end, color, target}] , chars: [{entity, color, target}]}}
interface OutColors {
  [coloring: string]: OutColor;
}

interface OutColor {
  [rowNum: string]: {positions: Array<PositionColor>, chars: Array<CharColor>};
}

interface PositionColor {
  start: number;
  end: number;
  color?: string;
  target: string;
}

interface CharColor {
  entity: string;
  color?: string;
  target: string;
}

export class ColorsModel {

  palette: OutColors;
  amino = ['A', 'I', 'L', 'M', 'V', 'F', 'Y', 'W', 'N', 'C', 'Q', 'S', 'T', 'D', 'E', 'R', 'H', 'K', 'G', 'P'];
  clustal = { G: 'rgb(219, 95, 29)', P: 'rgb(219, 95, 29)', S: 'rgb(219, 95, 29)', T: 'rgb(219, 95, 29)',
              H: 'rgb(194, 27, 12)', K: 'rgb(194, 27, 12)', R: 'rgb(194, 27, 12)',
              F: 'rgb(22, 31, 199)', W: 'rgb(22, 31, 199)', Y: 'rgb(22, 31, 199)',
              I: 'rgb(4, 112, 33)', L: 'rgb(4, 112, 33)', M: 'rgb(4, 112, 33)', V: 'rgb(4, 112, 33)'
  };


  getRowsList(coloring: string) {
    const outCol = this.palette[coloring];
    if (!outCol) {
      return [];
    }
    return Object.keys(outCol);
  }

  getPositions(coloring: string, rowNum: number) {
    let outCol: any;
    outCol = this.palette[coloring];
    if (!outCol) {
      return [];
    }
    outCol = outCol[rowNum];
    if (!outCol) {
      return [];
    }
    outCol = outCol.positions;
    if (!outCol) {
      return [];
    }
    return outCol;
  }

  getChars(coloring: string, rowNum: number) {
    let outCol: any;
    outCol = this.palette[coloring];
    if (!outCol) {
      return [];
    }
    outCol = outCol[rowNum];
    if (!outCol) {
      return [];
    }
    outCol = outCol.chars;
    if (!outCol) {
      return [];
    }
    return outCol;
  }

  process(inp: InpColors, sep: string) {

    this.transformInput(inp, sep);
    this.transformColors();
  }

  private transformInput(inp: InpColors, sep: string) {

    // if don't receive new colors, keep old colors
    if (!inp) {
      return;
    }

    // if receive new colors, change them
    this.palette = {};

    let info;
    let regions;
    // transform input structure
    // tslint:disable-next-line:forin
    for (const reg in inp) {

      // if first element in region is a number: e.g. '1-2'
      if (reg.indexOf(sep) > -1) {

        regions = reg.split(sep);
        if (regions.length !== 2) {
          Log.w(1, 'wrong region format.');
          continue;
        }

        regions[0] = +regions[0];
        regions[1] = +regions[1];
        if (isNaN(regions[0]) || isNaN(regions[1])) {
          Log.w(1, 'wrong region bounds.');
          continue;
        } else if (regions[0] > regions[1]) {
          Log.w(1, 'end bound less than start bound.');
          continue;
        }

        for (const e of inp[reg]) {
          info = this.processColor(e);
          if (info === -1) {
            continue;
          }

          this.palette[info.type][info.row].positions
            .push({start: regions[0] - 1, end: regions[1] - 1, color: e.color, target: info.target});
        }
      } else {

        for (const e of inp[reg]) {
          info = this.processColor(e);
          if (info === -1) {
            continue;
          }
          // reg shortcut for all aminoacids
          if (reg === `@amino@`) {
            for (const aa of this.amino) {
              this.palette[info.type][info.row].chars.push({entity: aa, color: e.color, target: info.target});
            }
          } else {
            // if region contains chars: e.g. 'A' || 'ATG' || '1'
            this.palette[info.type][info.row].chars.push({entity: reg, color: e.color, target: info.target});
          }
        }
      }
    }
  }

  private transformColors() {

    let arrColors;
    let n;
    let c;
    let t;
    for (const type in this.palette) {
      if (type === 'adjacent' || type === 'opposite') {
        console.log(this.palette);
        // tslint:disable-next-line:forin
        for (const row in this.palette[type]) {
          c = this.palette[type][row];
          n = c.positions.length + c.chars.length;
          type === 'adjacent' ? arrColors = this.adjacent(n) : arrColors = this.opposite(n);
          c.positions.sort((a, b) => (a.start > b.start) ? 1 : -1);

          for (const e of c.positions) {
            e.color = arrColors.pop();
          }

          for (const e of c.chars) {
            e.color = arrColors.pop();
          }
        }

      } else if (type === 'custom') {

        // tslint:disable-next-line:forin
        for (const row in this.palette[type]) {
          c = this.palette[type][row];

          // tslint:disable-next-line:forin
          for (const e in c.positions) {
            t = c.positions[e];
            t.color = this.checkColor(t.color);
            if (t.color === -1) {
              delete c.positions[e];
            }
          }

          // tslint:disable-next-line:forin
          for (const e in c.chars) {
            t = c.chars[e];
            t.color = this.checkColor(t.color);
            if (t.color === -1) {
              delete c.chars[e];
            }
          }
        }
      } else if (type == 'clustal') {
        for (const row in this.palette[type]) {
          c = this.palette[type][row];
          if (c.positions > 0) {

            for (const pos of c.positions) {
              for (let i = pos.start; i <= pos.end; i++) {
                c.positions.push({start: i, end: i, color: '@clustal'});
              }
            }
          }
          for (const e in c.chars) {
            t = c.chars[e];
            if (t.entity in this.clustal) {
              t.color = this.clustal[t.entity];
            } else {
              delete c.chars[e];
            }
          }
        }
      } else {
        Log.w(1, 'Unknown coloring type.');
      }
    }
  }

  private processColor(e: InpColor) {

    const result = {type: 'custom', row: -1, target: 'background-color:'};

    // check if row key is a number
    if (e.row === undefined || isNaN(+e.row)) {
      Log.w(1, 'wrong entity row key.');
      return -1;
    }
    result.row = +e.row;

    // check if target has valid value
    if (e.target && e.target !== 'background' &&
          e.target !== 'foreground' && e.target !== 'border') {
        Log.w(1, 'wrong color target.');
        return -1;
    }

    // transform target in CSS property
    if (e.target) {
      if (e.target === 'background') {
        result.target = 'background-color:';
      } else if (e.target === 'foreground') {
        result.target = 'color:';
      } else if (e.target === 'border') {
        result.target = 'border: 1px solid';
      }
    }

    // define color type
    if (e.color[0] === '@') {
      result.type = e.color.substr(1);
    }

    // reserving space for the transformed object (this.palette)
    // if color type not inserted yet
    if (!(result.type in this.palette)) {
      this.palette[result.type] = {};
    }
    // if row not inserted yet
    if (!(result.row in this.palette[result.type])) {
      this.palette[result.type][result.row] = {positions: [], chars: []};
    }
    return result;
  }

  private checkColor(color: string) {

    if (color[0] === '(') {
      return this.checkRgb(color);
    } else if (color[0] === '#') {
      const rgb = this.checkHex(color);
      if (rgb !== -1) {
        return this.checkRgb(rgb);
      }
      return -1;
    } else {
      Log.w(1, 'invalid color format');
      return -1;
    }
  }

  private checkHex(color: string) {

    const c = {
      0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, a: 10,
      b: 11, c: 12, d: 13, e: 14, f: 15, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15
    };
    let l1;
    let l2;
    let rgb = '(';
    const hex = color.replace('#', '');

    if (hex.length !== 6) {
      Log.w(1, 'invalid hex format.');
      return -1;
    }

    for (let i = 0; i < 3; i++) {
      l1 = c[hex[i * 2]];
      l2 = c[hex[i * 2 + 1]];
      if (l1 === undefined || l2 === undefined) {
        Log.w(1, 'Invalid char in hex value.');
        return -1;
      }

      rgb += (l1 * 16 + l2).toString() + ', ';
    }
    return rgb.substr(0, rgb.length - 2).concat(')');
  }

  private checkRgb(color: string) {

    let tmp;
    let prefix;
    let result;
    const rgb = color.replace('(', '')
      .replace(')', '')
      .split(',');

    if (rgb.length > 2) {

      for (let i = 0; i < 3; i++) {
        tmp = +rgb[i];
        if (isNaN(tmp) || tmp < 0 || tmp > 255) {
          Log.w(1, 'wrong value for rgb.');
          return -1;
        }
      }
      prefix = 'rgb';
    }

    if (rgb.length > 3) {
      tmp = +rgb[3];
      if (isNaN(tmp) || tmp < 0 || tmp > 1) {
        Log.w(1, 'wrong opacity value for rgb.');
        return -1;
      }
      prefix = 'rgba';
      result = '(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + rgb[3] + ')';
    } else {
      result = '(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    }

    if (rgb.length <= 2 || rgb.length > 4) {
      Log.w(1, 'invalid format for rgb.');
      return -1;
    }

    return prefix + result;

  }

  private opposite(n: number) {
    const result = [];
    const mid = Math.floor(n / 2);
    const cls = this.evenlySpacedColors(n);
    for (let i = 0; i < n; i ++) {
      if (i % 2 === 0) {
        result.push(cls[i / 2]);
      } else {
        result.push(cls[mid + (i + 1) / 2]);
      }
    }
    return result;
  }

  private adjacent(n: number) {
    return this.evenlySpacedColors(n);
  }

  private evenlySpacedColors( n: number ) {
    /** how to go around the rgb wheel */
    /** add to next rgb component, subtract to previous */
    /**  ex.: 255,0,0 -(add)-> 255,255,0 -(subtract)-> 0,255,0 */

      // starting color: red
    const rgb = [255, 0, 0];
    // 1536 colors in the rgb wheel
    const delta = Math.floor(1536 / n);

    let remainder;
    let add = true;
    let value = 0;
    let tmp;

    const colors = [];
    for (let i = 0; i < n; i++) {
      remainder = delta;
      while (remainder > 0) {
        if (add) {
          tmp = (((value + 1) % 3) + 3) % 3;
          if (rgb[tmp] + remainder > 255) {
            remainder -= (255 - rgb[tmp]);
            rgb[tmp] = 255;
            add = false;
            value = tmp;
          } else {
            rgb[tmp] += remainder;
            remainder = 0;
          }
        } else {
          tmp = (((value - 1) % 3) + 3) % 3;
          if (rgb[tmp] - remainder < 0) {
            remainder -= rgb[tmp];
            rgb[tmp] = 0;
            add = true;
          } else {
            rgb[tmp] -= remainder;
            remainder = 0;
          }
        }
      }
      colors.push('rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ', 0.4)');
    }
    return colors;
  }
}
