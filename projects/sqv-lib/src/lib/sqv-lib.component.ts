import {Component, Input, OnChanges} from '@angular/core';
import { ParametersModel } from './models/parameters.model';
import {RowsModel} from './models/rows.model';
import {ColorsModel} from './models/colors.model';
import {Log} from './models/log.model';

@Component ({
  selector: 'mb-sqv-lib',
  template: 'prova: {{sqvBody}}'
})

export class SqvLibComponent implements OnChanges {
  @Input() inp: any;
  params: ParametersModel;
  rows: RowsModel;
  colors: ColorsModel;
  sqvBody;
  data;

  constructor() {
    this.params = new ParametersModel();
    this.rows = new RowsModel();
    this.colors = new ColorsModel();
    this.data = [];

  }

  ngOnChanges() {

    if (this.inp === undefined) {
      return;
    }

    /** check and process parameters input */
    this.params.process(this.inp.parameters);

    /** check and process rows input */
    this.rows.process(this.inp.rows);

    /** check and process colors input */
    this.colors.process(this.inp.colors, this.params.getSeparator());

    /** apply color to data rows */
    this.processRowsCols();
  }

  processRowsCols() {

    this.data = [];

    // decide which color is more important in case of overwriting
    const coloringOrder = ['custom', 'opposite', 'adjacent'];
    const methodOrder = ['positions', 'chars'];

    // order row Numbers
    const rowNumsOrdered = this.rows.getRowsList().map(Number).sort((n1, n2) => n1 - n2);

    // order keys of Row object
    const ordered = {};
    for (const rowNum of rowNumsOrdered) {
      ordered[rowNum] = Object.keys(this.rows.getRow(+rowNum)).map(Number).sort((n1, n2) => n1 - n2);
    }

    let data;
    let coloringRowNums;
    let tmp;
    let tmp1;
    let log: string;
    // loop through data rows
    for (const rowNum of rowNumsOrdered) {
      tmp = ordered[rowNum];
      // data key: indexes, value: chars
      data = this.rows.getRow(rowNum);
      for (const coloring of coloringOrder.reverse()) {
        coloringRowNums = this.colors.getRowsList(coloring).map(Number);
        // if there is coloring for the data row
        if (coloringRowNums.indexOf(rowNum) < 0) {
          // go to next coloring
          continue;
        }

        for (const method of methodOrder.reverse()) {
          // applying chars colors
          if (method === 'chars') {
            // loop through entity colors
            for (const e of this.colors.getChars(coloring, rowNum)) {
              if (isNaN(+e.entity)) {
                // match chars in data
                tmp1 = this.findMatchingChars(data, tmp, e.entity);
              } else {
                // match strings in data
                tmp1 = this.findMatchingStrings(data, tmp, e.entity);
              }

              for (const match of tmp1) {
                for (const idx of match) {
                  if (data[idx].color) {
                    log = 'Row: ' + rowNum + ', ';
                    log += 'Index: ' + idx + ', ';
                    log += 'Prev color: ' + data[idx].color + ', ';
                    log += 'New color: ' + e.color + '.';
                    Log.w(2, log);
                  }
                  data[idx].color = e.color;
                  data[idx].target = e.target;
                }
              }
            }
          } else if (method === 'positions') {
            for (const e of this.colors.getPositions(coloring, rowNum)) {
              for (let i = e.start; i <= e.end; i++) {
                if (!data[i]) {
                  continue;
                }
                if (data[i].color) {
                  log = 'Row: ' + rowNum + ', ';
                  log += 'Index: ' + i + ', ';
                  log += 'Prev color: ' + data[i].color + ', ';
                  log += 'New color: ' + e.color + '.';
                  Log.w(2, log);
                }
                data[i].color = e.color;
                data[i].target = e.target;
              }
            }
          }
        }
      }
      this.data.push(data);
    }
    console.log(this.data);
  }

  private findMatchingChars(data, orderedKeys,  match: string) {

    const result = [];
    let j;
    let tmp;
    // loop through data
    for (let i = 0; i < orderedKeys.length; i++) {
      tmp = [];
      // search first matching char
      if (data[orderedKeys[i]].char === match[0]) {
        tmp.push(orderedKeys[i]);
        j = 1;
        while (j < match.length) {
          if (data[orderedKeys[i + j]].char !== match[j]) {
            tmp = [];
            break;
          }
          tmp.push(orderedKeys[i + j]);
          j++;
        }
        if (tmp.length > 0) {
          result.push(tmp);
        }
      }
    }
    return result;
  }

  private findMatchingStrings(data, orderedKeys,  match: string) {

    const result = [];
    // loop through data
    for (const idx of orderedKeys) {
      // search first matching char
      if (data[idx].char === match) {
        result.push([idx]);
      }
    }
    return result;
  }

}
