import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO, FolderViewType } from '@models';
import { environment } from '@root/environments/environment';

const baseUrl = environment.apiUrl.replace('/api', '');

@Pipe({
  name: 'publicViewLink'
})
export class PublicViewLinkPipe implements PipeTransform {

  constructor(
  ) { }

  transform(folder: FolderVO, view: FolderViewType): any {
    const rootArchive = folder.archiveNbr.split('-')[0] + '-0000';
    const base = `${baseUrl}/p/archive/${rootArchive}`;
    const folderView = view.split('.').pop();
    return `${base}/view/${folderView}/${folder.archiveNbr}/${folder.folder_linkId}`;
  }

}
