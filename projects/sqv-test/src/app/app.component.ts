import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  input: any = {
    rows: {
      1: {data: 'GGPSTTTKKHRRRRSKPLEEMSNKKRRRSMSNKKRRRSKPLEEMSNKKRRRS', filter: 'skipIndex_2'}
    },
    colors: {
      '1-3': [
        { row: '3', color: '@adjacent', target: 'background'},
        ],
      '17-26': [
        { row: '1', color: '#00ff00', target: 'background'}
      ],
      // '@amino@': [
      //   { row: '1', color: '@clustal', target: 'background'}
      // ]
    },
    parameters: {
      fontSize: '25px',
      chunkSize: '5',
      spaceSize: '1',
      log: 'debug'
    }
  };

  myInput: any = {
    rows: {
      1: {data: ['1', '2', '@alpha', '4', '5', '6'], filter: 'skipIndex_2'},
      2: {data: 'MSNKKRRRSKPLEEMSNKKRRRSKPLEEMSNKKRRRSKPLEE', filter: 'skipIndex_2'},
      3: {data:'MSNKKRRRSKPLEEMSNRRSKPLEEMSNKKRRRSKPLEE', filter: 'skipIndex_2'}
    },
    colors: {
      '1-15': [
        { row: '2', color: '@clustal', target: 'background'},
        { row: '3', color: '@adjacent', target: 'border'},
      ],
      '20-25': [
        { row: '2', color: '@clustal', target: 'background'},
        { row: '3', color: '@adjacent', target: 'border'},
      ],
      15: [
        { row: '2', color: '(22, 33, 4, 0.3)', target: 'background'},
        { row: '3', color: '@adjacent', target: 'border'},
      ],
      BA: [
        { row: '2', color: '#bb55cc', target: 'foreground'},
        { row: '3', color: '@adjacent', target: 'border'},
      ]
    },
    parameters: {
      fontSize: '25px',
      chunkSize: '5',
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
