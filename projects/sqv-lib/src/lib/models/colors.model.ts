import {Log} from './log.model';

interface Colors {
  [key: string]: Array<Color>;
}

interface Color {
  row: string;
  color: string;
  target?: string;
}

interface TransColor {
  [row: string]: { indexes: Array<EntityColor>, chars: Array<EntityColor> };
}

interface EntityColor {
  entity?: string;
  start?: number;
  end?: number;
  color?: string;
  target: string;
}

export class ColorsModel {
  // E.g.: 'coloring': {rowNum: { indexes:[{start, end, color, target}] , chars: [{entity, color, target}]}}
  palette: {[key: string]: TransColor};

  process(inp: Colors) {

    this.transformInput(inp);
  }



  private transformInput(inp: Colors) {
    this.palette = {};
    let info;
    let regions;
    // transform input structure
    // tslint:disable-next-line:forin
    for (const reg in inp) {

      // if region is a single number: e.g: '1'
      if (!isNaN(+reg)) {

        for (const e of inp[reg]) {
          info = this.processColor(e);
          if (info === -1) {
            continue;
          }
          this.palette[info.type][info.row].indexes.push({start: +reg, end: +reg, color: e.color, target: info.target});
        }

        // if first element in region is a number: e.g. '1-2'
      } else if (!isNaN(+reg[0])) {

        regions = reg.split('-');
        if (regions.length < 2) {
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
          this.palette[info.type][info.row].indexes.push({start: regions[0], end: regions[1], color: e.color, target: info.target});
        }
        // if region contains letters: e.g. 'A' || 'ATG'
      } else {

        for (const e of inp[reg]) {
          info = this.processColor(e);
          if (info === -1) {
            continue;
          }
          this.palette[info.type][info.row].chars.push({entity: reg, color: e.color, target: info.target});
        }

      }
    }
  }

  private transformColors() {

    let arrColors;
    let n;
    for (const type in this.palette) {
      if (type === 'adjacent' || type === 'opposite') {

        // tslint:disable-next-line:forin
        for (const row in this.palette.coloring) {
          n = type[row].indexes.length + type[row].chars.length;
          type === 'adjacent' ? arrColors = this.adjacent(n) : arrColors = this.opposite(n);
          type[row].indexes.sort((a, b) => (a.start > b.start) ? 1 : -1);

          for (const e of type[row].indexes) {
            e.color = arrColors.pop();
          }

          for (const e of type[row].chars) {
            e.color = arrColors.pop();
          }
        }

      } else if (type === 'custom') {

      } else {
        Log.w(1, 'Unknown coloring type.');
      }
    }
  }

  private processColor(e: Color) {

    const result = {type: 'custom', row: -1, target: 'background'};

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
    if (e.target) {
      result.target = e.target;
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
      this.palette[result.type][result.row] = {indexes: [], chars: []};
    }
    return result;
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
          console.log([add, value, tmp]);
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
          console.log([add, value, tmp]);
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
      colors.push('(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')');
    }

    return colors;
  }
}
