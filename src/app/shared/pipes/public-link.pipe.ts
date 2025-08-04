import { Pipe, PipeTransform } from '@angular/core';
import { FolderVO, RecordVO } from '@models';
import { environment } from '@root/environments/environment';
import { PublicRoutePipe } from '@shared/pipes/public-route.pipe';

const baseUrl = environment.apiUrl.replace('/api', '');

@Pipe({
  name: 'publicLink',
  standalone: false,
})
export class PublicLinkPipe implements PipeTransform {
  constructor(private routePipe: PublicRoutePipe) {}

  transform(value: RecordVO | FolderVO, args?: any): string {
    const route = this.routePipe.transform(value, args).join('/');
    return `${baseUrl}${route}`;
  }
}
