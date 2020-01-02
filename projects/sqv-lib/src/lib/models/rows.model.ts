import {Log} from './log.model';
import {FiltersModel} from './filters.model';
import {ColorsModel} from './colors.model';

interface Rows {
  [key: number]: Row;
}

interface Row {
  data: (string | Array<string> | Dict);
  filter?: string;
}

interface Dict {
  [key: string]: string;
}

export class RowsModel {

  rows: Rows;

  constructor() {
    this.rows = { 1: {data: ''}};
  }

  process(rows: Rows) {
    // console.log(rows);

    let data;
    let filter;
    // tslint:disable-next-line:forin
    for (const row in rows) {

      /** check rows key */
      if (isNaN(+row)) {
        Log.w(1, 'wrong rows key format.');
        delete rows[row];
        continue;
      }

      data = rows[row].data;
      filter = rows[row].filter;

      /** check data type */
      if (typeof data === 'string') {
        const tmp = {};
        for (let i = 0; i < data.length; i++) {
          tmp[i] = data[i];
        }
        data = tmp;
      } else if (data instanceof Array) {
        const tmp = {};
        data.forEach((c, i) => tmp[i] = c);
        data = tmp;
      } else if (typeof data === 'object') {
        /** check data keys */
        for (const key in data) {
          if (isNaN(+key)) {
            Log.w(1, 'wrong data key object format');
            delete rows[row];
            continue;
          }
        }
      } else {
        Log.w(1, 'wrong data format.');
        delete rows[row];
        continue;
      }

      /** apply filters */
      if (filter !== undefined) {
        data = FiltersModel.process(data, filter);
      }


    }
    console.log(rows);

  }
}
