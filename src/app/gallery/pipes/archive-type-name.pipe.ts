/* @format */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'archiveTypeName',
})
export class ArchiveTypeNamePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
