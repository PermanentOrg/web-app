/* @format */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accessRole',
})
export class AccessRolePipe implements PipeTransform {
  roles = {
    'access.role.viewer': 'Viewer',
    'access.role.contributor': 'Contributor',
    'access.role.editor': 'Editor',
    'access.role.curator': 'Curator',
    'access.role.manager': 'Manager',
    'access.role.owner': 'Owner',
  };

  transform(value: string): string {
    return this.roles[value];
  }
}
