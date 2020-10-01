import { Injectable } from '@angular/core';
import { AccessRole } from '@models/access-role.enum';
import { ProfileTemplate } from '@models/profile-item-vo';

declare var require: any;
const SYNC_CONSTANTS = require('../../../../../constants/master_en.json');
const PROFILE_TEMPLATE = require('../../../../../constants/profile_template.json');
const COUNTRY_CODES = require('../../../../../constants/country_codes.json');

export interface Country {
  name: string;
  abbrev: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrConstantsService {
  private profileTemplate = PROFILE_TEMPLATE;
  private constants = SYNC_CONSTANTS;
  private countries: Country[] = COUNTRY_CODES.map(c => {
    return { name: c['@name'], abbrev: c['@alpha-2'] };
  });

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

  public getCountries() {
    return this.countries;
  }

  public getStates() {
    return this.constants['us_states'];
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

  public getProfileTemplate(): ProfileTemplate {
    return this.profileTemplate;
  }
}
