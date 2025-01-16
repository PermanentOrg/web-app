import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newlineText',
})
export class NewlineTextPipe implements PipeTransform {
  transform(text: any, ...args: any[]): any {
    if (!text || !text.length) {
      return text;
    }

    return '<p>' + text.replace(new RegExp('\n', 'g'), '</p><p>') + '</p>';
  }
}
