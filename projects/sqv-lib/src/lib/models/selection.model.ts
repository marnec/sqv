interface Cell {
  row: number;
  index: number;
}

export class SelectionModel {

  selected: boolean;
  start: Cell;
  end: Cell;

  constructor() {
    this.selected = false;

    window.onmousedown = (e) => {
      console.log('WORKING! ' + e.button);
    };
  }

}
