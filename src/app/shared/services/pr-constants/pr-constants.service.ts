import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const SYNC_CONSTANTS = require('../../../../../../files/constants/master_en.json');

@Injectable({
  providedIn: 'root'
})
export class PrConstantsService {
  private constants = SYNC_CONSTANTS;

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
