import {AfterViewInit, Component, Input, OnChanges, OnInit} from '@angular/core';
import { ParametersModel } from './models/parameters.model';
import {RowsModel} from './models/rows.model';
import {ColorsModel} from './models/colors.model';
import {Log} from './models/log.model';
import {SelectionModel} from './models/selection.model';

@Component ({
  selector: 'mb-sqv-lib',
  template: '<div [ngClass]="classId"></div>',
  styleUrls: ['./sqv-lib.component.css']
})

export class SqvLibComponent implements OnChanges, OnInit, AfterViewInit {

  static counter = 0;
  static sqvList = [];

  @Input() inp: any;
  classId: string;
  init: boolean;
  params: ParametersModel;
  rows: RowsModel;
  colors: ColorsModel;
  selection: SelectionModel;
  data;

  constructor() {

    this.init = false;
    this.params = new ParametersModel();
    this.rows = new RowsModel();
    this.colors = new ColorsModel();
    this.selection = new SelectionModel();
    this.data = [];

    window.onresize = () => {

      for (const id of SqvLibComponent.sqvList) {

        const sqvBody = document.getElementsByClassName(id);
        if (!sqvBody || sqvBody.length === 0) {
          Log.w(1, 'Cannot find sqv-body element.');
          return;
        }

        const chunks = sqvBody[0].getElementsByClassName('chunk');
        if (!chunks) {
          Log.w(1, 'Cannot find chunk elements.');
          return;
        }

        let oldTop = 0;
        let newTop;
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < chunks.length; i++) {
          newTop = chunks[i].getBoundingClientRect().top;
          if (newTop > oldTop) {
            chunks[i].firstElementChild.className = 'index';
            oldTop = newTop;
          } else {
            chunks[i].firstElementChild.className = 'index hidden';
          }
        }
      }
    };
  }

  ngOnInit(): void {
    this.classId = 'root sqv-body-' + SqvLibComponent.counter;
    SqvLibComponent.counter += 1;
  }

  ngAfterViewInit(): void {
    this.init = true;
    SqvLibComponent.sqvList.push(this.classId);
    this.ngOnChanges();
  }

  ngOnChanges() {
    console.log(this.init);
    console.log(this.inp);

    if (!this.init || this.inp === undefined) {
      return;
    }

    /** check and process parameters input */
    this.params.process(this.inp.parameters);
    console.log('check and process parameters input');

    /** check and process rows input */
    this.rows.process(this.inp.rows);
    console.log('check and process rows input');

    /** check and process colors input */
    this.colors.process(this.inp.colors, this.params.getSeparator());
    console.log('check and process colors input');

    /** apply color to data rows */
    this.processRowsCols();
    console.log('apply color to data rows');


    /** create/update sqv-body html */
    this.createGUI();
    console.log(' create/update sqv-body html');
  }

  processRowsCols() {

    this.data = [];

    // decide which color is more important in case of overwriting
    const coloringOrder = ['custom', 'clustal', 'opposite', 'adjacent'];
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
              if (e !== undefined) {
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
            }
          } else if (method === 'positions') {
            const positions = this.colors.getPositions(coloring, rowNum);

            if (positions.length > 0) {
              for (const e of positions) {
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
      }
      console.log(this.data);
      this.data.push(data);
    }
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

  private createGUI() {
    console.log('start create GUI');

    const sqvBody = document.getElementsByClassName(this.classId);
    if (!sqvBody || sqvBody.length === 0) {
      Log.w(1, 'Cannot find sqv-body element.');
      return;
    }
    const chunkSize = this.params.getChunkSize();
    const emptyFiller = this.params.getEmptyFiller();
    const fontSize = this.params.getFontSize();
    const spaceSize = this.params.getSpaceSize();

    const percent = 0.15;
    const adjust = 3 / 5;

    // max index and number of chars among data rows
    let maxIdx = 0;
    let maxChars = 1;
    let chunkHeight = 0;
    const rowFont = [];
    let actualChar;
    for (const row of this.data) {
      actualChar = 0;
      // tslint:disable-next-line:forin
      for (const idx in row) {

        if (maxIdx < +idx) {
          maxIdx = +idx;
        }
        if (maxChars < row[idx].char.length) {
          maxChars = row[idx].char.length;
        }
        if (actualChar < row[idx].char.length) {
          actualChar = row[idx].char.length;
        }
      }
      actualChar = 1 - (percent * (actualChar - 1));
      rowFont.push(actualChar);
      chunkHeight += actualChar;
    }

    if (chunkSize > 0) {
      maxIdx += (chunkSize - (maxIdx % chunkSize)) % chunkSize;
    }
    maxChars = adjust * (maxChars * (1 - percent * (maxChars - 1)));

    console.log('start building divs');

    sqvBody[0].innerHTML = '';
    let oldHeight = 0;
    let chunk;
    let index = '';
    let cards = '';
    let cells = '';
    let cell;
    let entity;
    let style;
    let html = '';

    for (let i = 1; i <= maxIdx; i++) {
      for (let j = 0; j < this.data.length; j++) {
        entity = this.data[j][i];
        style = 'font-size: ' + rowFont[j] + 'em;';
        if (!entity) {
          cell = `<div class="cell" style="${style}">${emptyFiller}</div>`;
        } else {
          if (entity.target && entity.color) {
            style += `${entity.target} ${entity.color};`;
          }
          cell = `<div class="cell" style="${style}">${entity.char}</div>`;
        }
        cells += cell;

      }

      style = `width: ${maxChars}em;`;
      cards += `<div class="card" style="${style}">${cells}</div>`;
      cells = '';

      if (chunkSize > 0 && i % chunkSize === 0) {

        style = `height: ${chunkHeight}em;`;
        index = `<div class="absolute">${i + 1 - chunkSize}</div>`;
        index = `<div class="index hidden" style="${style}">${index}</div>`;

        style = `font-size: ${fontSize};`;
        if (i !== maxIdx) {
          style += 'padding-right: ' + spaceSize + 'em;';
        } else {
          style += 'margin-right: ' + spaceSize + 'em;';
        }

        chunk = `<div class="chunk" style="${style}">${index}${cards}</div>`;
        // chunk = `<div class="chunk" style="${style}">${cards}</div>`;
        cards = '';
        index = '';

        html += chunk;
        // if (oldHeight < sqvBody[0].clientHeight) {
        //   oldHeight = sqvBody[0].clientHeight;
        //   sqvBody[0].lastElementChild.firstElementChild.className = 'index';
        // }
      }
    }

    sqvBody[0].innerHTML = html;
    window.dispatchEvent(new Event('resize'));
  }

}
