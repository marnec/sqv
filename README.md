Download: npm i sqv-lib 

Integration example:

-app.module.ts:
import {SqvLibModule} from 'sqv-lib';


-template.html:
<mb-sqv-lib [inp]="options"></mb-sqv-lib>

-component.ts
public options = {
  parameters: {
    fontSize: '14px',
    chunkSize: 5,
    skipIndex: 5,
    colorChoice: 'opposite'
  },
  rows: {
    1: {data: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"}
  },
  colors: {'15-20': [{row: 1, color: "#AB9C9C"}]}
};
