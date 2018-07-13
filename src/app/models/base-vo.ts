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
}
