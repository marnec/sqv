import { NgModule } from '@angular/core';
import { SqvLibComponent } from './sqv-lib.component';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [SqvLibComponent],
    imports: [
        CommonModule
    ],
  exports: [SqvLibComponent]
})

export class SqvLibModule { }
