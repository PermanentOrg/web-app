import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'prependProtocol',
})
export class PrependProtocolPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      value = 'https://' + value;
    }

    return value
  }
}
