import {Component, Input, OnChanges} from '@angular/core';
import { ParametersModel } from './models/parameters.model';
import {RowsModel} from './models/rows.model';
import {ColorsModel} from './models/colors.model';

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
    this.colors.process(this.inp.colors);

  }
}

