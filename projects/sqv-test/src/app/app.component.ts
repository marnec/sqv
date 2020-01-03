import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<mb-sqv-lib [inp]="this.input"></mb-sqv-lib><button (click)="change()">BOTTONAZZO</button>',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  input: any = {
    rows: {
      1: {data: ['1', '2', '3', '4', '5', '6'], filter: 'skipIndex_2'},
      2: {data: 'BABABABBABABABBA', filter: 'skipIndex_2'},
      3: {data: {5: 'a', 2: 'r'}, filter: 'skipIndex_2'}
    },
    colors: {
      '1-3': [
        { row: '2', color: '#a1b2c3', target: 'background'},
        { row: '3', color: '@adjacent', target: 'border'},
        ],
      15: [
        { row: '2', color: '(22, 33, 4, 0.3)', target: 'background'},
        { row: '3', color: '@adjacent', target: 'border'},
      ],
      ATG: [
        { row: '2', color: '#bb55cc', target: 'background'},
        { row: '3', color: '@adjacent', target: 'border'},
      ]
    },
    parameters: {
      fontSize: '14px',
      chunkSize: '10',
      spaceSize: '1',
      log: 'debug'
    }
  };

  change() {
    this.input = {
      rows: {
        2: {data: 'BABABABBABABABBA', filter: 'skipIndex_2'}
      },
      colors: {
        A: [
          { row: '2', color: '(255, 0, 0)', target: 'background'}
        ]
      }
    };
  }

}
