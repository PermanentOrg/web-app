import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'metadataValue',
})
export class MetadataValuePipe implements PipeTransform {
  transform(value: string): string {
    if (value.includes(':')) {
      return value.split(':').slice(1).join(':');
    }
    return value;
  }
}
