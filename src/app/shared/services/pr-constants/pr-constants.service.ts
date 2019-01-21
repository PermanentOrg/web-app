import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { access } from 'fs';
import { orderBy } from 'lodash';
import { AccessRole } from '@models/access-role.enum';

declare var require: any;
const SYNC_CONSTANTS = require('../../../../../../files/constants/master_en.json');

@Injectable({
  providedIn: 'root'
})
export class PrConstantsService {
  private constants = SYNC_CONSTANTS;
  private accessRoles = [
    {
      type: 'access.role.viewer',
      name: 'Viewer',
      level: AccessRole.Viewer
    },
    {
      type: 'access.role.contributor',
      name: 'Contributor',
      level: AccessRole.Contributor
    },
    {
      type: 'access.role.editor',
      name: 'Editor',
      level: AccessRole.Editor
    },
    {
      type: 'access.role.curator',
      name: 'Curator',
      level: AccessRole.Curator
    },
    {
      type: 'access.role.owner',
      name: 'Owner',
      level: AccessRole.Owner
    },
  ];

  constructor() {}

  public getConstants() {
    return this.constants;
  }

  public getRelations() {
    const relationTypes = [];
    for (const key in this.constants.relation) {
      if (key === 'family') {
        // tslint:disable-next-line:forin
        for (const familyKey in this.constants.relation.family) {
          relationTypes.push({
            type: `relation.family.${familyKey}`,
            name: this.constants.relation.family[familyKey]
          });
        }
      } else {
        relationTypes.push({
          type: `relation.${key}`,
          name: this.constants.relation[key]
        });
      }
    }

    return relationTypes;
  }

  public getAccessRoles() {
    return this.accessRoles;
  }

  public translate(translateString: string) {
    const split = translateString.split('.');
    let currentBranch = this.constants;
    while (split.length && currentBranch) {
      const path = split.shift();
      currentBranch = currentBranch[path];
    }

    return currentBranch || translateString;
  }
}
