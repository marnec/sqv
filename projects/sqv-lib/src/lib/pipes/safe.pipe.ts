import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safe'
})
export class SafePipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {}

  public transform(value: any, type: string): SafeHtml {

    if (type === 'html') {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    } else {
      throw new Error(`Invalid safe type specified: ${type}`);
    }


  }
}
