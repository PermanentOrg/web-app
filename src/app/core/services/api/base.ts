import { HttpService } from '../http/http.service';

export class BaseResponse {
  public isSuccessful: Boolean;
  public isSystemUp: Boolean;
  public Results: any[];
  public csrf: string;

  private sessionId: string;
  private createdDT: Date;
  private updatedDT: Date;

  constructor(response?: any) {
    if (!response) {
      return;
    }

    this.isSuccessful = response.isSuccessful;
    this.isSystemUp = response.isSystemUp;
    this.Results = response.Results;

    this.sessionId = response.sessionId;
    this.csrf = response.csrf;
  }

  public getMessage(): String {
    if (!this.Results.length) {
      return '';
    }

    return this.Results[0].message[0];
  }

  public getResults(): any[] {
    return this.Results.map(result => result.data);
  }

  public messageIncludes(phrase: String): Boolean {
    for (let i = 0; i < this.Results[0].message; i++) {
      if (this.Results[0].message[i].includes(phrase)) {
        return true;
      }
    }
  }

  public setData(data: any[]) {
    this.Results = [{
      data: data
    }];
  }
}

export class BaseRepo {
  constructor(public http: HttpService) { }

}
