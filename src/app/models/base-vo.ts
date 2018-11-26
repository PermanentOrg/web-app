import { RecordVOData } from '@models/record-vo';
import { FolderVOData } from '@models/folder-vo';

export class BaseVO {
  public dataWhitelist: string[];
  public cleanParams = [];

  public status: string;

  constructor (voData: any) {
    if (voData) {
      for ( const key in voData ) {
        if (voData[key] !== undefined) {
          this[key] = voData[key];
        }
      }
    }
  }

  public update (voData: any | RecordVOData | FolderVOData) {
    if (voData) {
      for ( const key in voData ) {
        if (voData[key] !== undefined) {
          this[key] = voData[key];
        }
      }
    }
  }

  public getCleanVO () {
    if (!this.cleanParams.length) {
      return this;
    } else {
      const clean = {};
      this.cleanParams.forEach((param) => {
        clean[param] = this[param];
      });

      return clean;
    }
  }
}
