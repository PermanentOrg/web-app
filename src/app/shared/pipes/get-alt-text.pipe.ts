/* @format */
import { Pipe, PipeTransform } from '@angular/core';
import { ItemVO } from '../../models/index';

@Pipe({
  name: 'getAltText',
  pure: false,
})
export class GetAltTextPipe implements PipeTransform {
  transform(value: ItemVO): string {
    if (value?.altText) {
      return value?.altText;
    }
    if (!value?.displayName) {
      return 'Click to add alt text';
    }
    return value?.displayName;
  }
}
