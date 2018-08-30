import { RecordVOData } from '@models/record-vo';
import { FolderVOData } from '@models/folder-vo';

export class BaseVO {
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
}
