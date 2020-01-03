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

  constructor() {
    this.params = new ParametersModel();
    this.rows = new RowsModel();
    this.colors = new ColorsModel();

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

  }

  processRowsCols() {

    const coloringOrder = ['custom', 'opposite', 'adjacent'];
    const methodOrder = ['positions', 'chars'];

    // ordering keys of Row object
    const rowNumsOrdered = {};
    for (const row of this.rows.getRowsList()) {
      rowNumsOrdered[row] = Object.keys(this.rows.getRow(+row)).sort();
    }

    let arrEntities: any;
    let data;
    for (const coloring of coloringOrder.reverse()) {
      // tslint:disable-next-line:forin
        for (const rowNum in this.colors.getRowsList(coloring)) {

          if (!rowNumsOrdered[rowNum]) {
            Log.w(1, 'mismatch between row numbers.');
            continue;
          }

          data = this.rows.getRow(+rowNum);
          for (const method in methodOrder.reverse()) {

            if (method === 'chars') {

              for (const e of this.colors.getChars(coloring, +rowNum)) {
                for (const idx of rowNumsOrdered[rowNum]) {
                  // TODO: match chars in data
                }
              }

            } else if (method === 'positions') {
              arrEntities = this.colors.getPositions(coloring, +rowNum);

            }
          }
        }
    }
  }
}

