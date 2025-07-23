import { Pipe, PipeTransform } from '@angular/core';

const MB = 1024 * 1024;
const GB = 1024 * MB;
const TB = 1024 * GB;

const GB_THRESHOLD = MB * 100;
const TB_THRESHOLD = GB * 100;

@Pipe({
  name: 'prStorageAmount',
  standalone: false,
})
export class StorageAmountPipe implements PipeTransform {
  transform(bytes: number = 0, precision: number = 1): string {
    let result: string;
    if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) {
      result = '';
    } else if (bytes > TB_THRESHOLD) {
      result = (bytes / TB).toFixed(+precision) + ' ' + 'TB';
    } else if (bytes > GB_THRESHOLD) {
      result = (bytes / GB).toFixed(+precision) + ' ' + 'GB';
    } else {
      result = (bytes / MB).toFixed(+precision) + ' ' + 'MB';
    }
    return result;
  }
}
