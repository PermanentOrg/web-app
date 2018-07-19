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
