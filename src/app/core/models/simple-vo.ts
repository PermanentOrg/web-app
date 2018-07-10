export class SimpleVO {
  public key;
  public value;

  constructor (voData: any) {
    if (voData) {
      for ( const key in voData ) {
        if (voData[key]) {
          this[key] = voData[key];
        }
      }
    }
  }
}
