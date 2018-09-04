export class Deferred {
  public promise: Promise<any>;
  public resolve: Function;
  public reject: Function;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
