import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, ItemVO, RecordVO, FolderSizeVOData } from '@models';

@Pipe({
  name: 'folderContents'
})
export class FolderContentsPipe implements PipeTransform {

  constructor() {
  }

  transform(folderSizeVo: FolderSizeVOData, args?: any): string {
    if (folderSizeVo) {
      const fileCount = folderSizeVo.allRecordCountShallow;
      const folderCount = folderSizeVo.allFolderCountShallow;
      const fileLabel = fileCount > 1 ? 'files' : 'file';
      const folderLabel = folderCount > 1 ? 'folders' : 'folder';

      if (fileCount && folderCount) {
        return `${folderCount} ${folderLabel} and ${fileCount} ${fileLabel}`;
      } else if (fileCount) {
        return `${fileCount} ${fileLabel}`;
      } else if (folderCount) {
        return `${folderCount} ${folderLabel}`;
      } else {
        return 'Empty';
      }
    } else {
      return '';
    }
  }
}
