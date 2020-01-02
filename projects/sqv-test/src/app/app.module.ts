import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { SqvLibModule } from 'sqv-lib';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    SqvLibModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
