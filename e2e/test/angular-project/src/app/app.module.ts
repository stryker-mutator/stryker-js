import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NoopDirective } from './noop.directive';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    NoopDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: []
})
export class AppModule { }
