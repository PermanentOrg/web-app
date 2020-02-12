import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO } from '@models/index';
@Pipe({
  name: 'shareActionLabel'
})
export class ShareActionLabelPipe implements PipeTransform {

  constructor(
  ) { }

  transform(accessRole: string, args?: any): any {
    switch (accessRole) {
      case 'access.role.owner':
        return 'Edit';
      case 'access.role.curator':
        return 'Curate';
      case 'access.role.editor':
        return 'Comment';
      case 'access.role.contributor':
        return 'Contribute';
      case 'access.role.viewer':
      default:
        return 'View in my archive';
    }
  }
}
