import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO } from '@models/index';
import { environment } from '@root/environments/environment';

const baseUrl = environment.apiUrl.replace('/api', '');

@Pipe({
  name: 'publicLink'
})
export class PublicLinkPipe implements PipeTransform {

  constructor(
  ) { }

  transform(value: RecordVO | FolderVO, args?: any): any {
    const rootArchive = value.archiveNbr.split('-')[0] + '-0000';
    const base = `${baseUrl}/p/archive/${rootArchive}`;
    if (value instanceof RecordVO) {
      return `${base}/record/${value.archiveNbr}`;
    } else {
      return `${base}/${value.archiveNbr}/${value.folder_linkId}`;
    }
  }

}
