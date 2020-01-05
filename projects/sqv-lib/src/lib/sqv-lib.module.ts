import { NgModule } from '@angular/core';
import { SqvLibComponent } from './sqv-lib.component';
import {SafePipe} from './pipes/safe.pipe';

@NgModule({
  declarations: [SqvLibComponent, SafePipe],
  imports: [
  ],
  exports: [SqvLibComponent]
})

export class SqvLibModule { }
