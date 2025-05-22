import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO } from '@models';
import { FolderView } from '@shared/services/folder-view/folder-view.enum';

@Pipe({
  name: 'itemTypeIcon',
})
export class ItemTypeIconPipe implements PipeTransform {
  constructor() {}

  transform(item: RecordVO | FolderVO, view?: FolderView): any {
    if ((item as RecordVO).recordId) {
      switch (item.type) {
        case 'type.record.image':
          return 'image';
        case 'type.record.audio':
          return 'audiotrack';
        case 'type.record.video':
          return 'videocam';
        case 'type.record.presentation':
          return 'show_chart';
        case 'type.record.document':
        case 'type.record.pdf':
          return 'article';
        default:
          return 'insert_drive_file';
      }
    } else if ((item as FolderVO).folderId) {
      switch (item.view) {
        case 'folder.view.timeline':
          return 'timeline';
        default:
          return 'folder';
      }
    }
  }
}
