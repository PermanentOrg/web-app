export class BaseResponse {
  public isSuccessful: Boolean;
  public isSystemUp: Boolean;
  public results: any[];

  private sessionId: String;
  private csrf: String;
  private createdDT: Date;
  private updatedDT: Date;

  constructor(response: any) {
    this.isSuccessful = response.isSuccessful;
    this.isSystemUp = response.isSystemUp;
    this.results = response.Results;

    this.sessionId = response.sessionId;
    this.csrf = response.csrf;
  }

  public getMessage(): String {
    if (!this.results.length) {
      return '';
    }

    return this.results[0].message[0];
  }

  public getResults(): any[] {
    return this.results.map(result => result.data);
  }

  public messageIncludes(phrase: String): Boolean {
    for (let i = 0; i < this.results[0].message; i++) {
      if (this.results[0].message[i].includes(phrase)) {
        return true;
      }
    }
  }
}
