import { HttpService } from '../http/http.service';
import { SimpleVO } from '../../models';

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

  public getMessage(): string {
    if (!this.Results.length) {
      return '';
    }

    return this.Results[0].message[0];
  }

  public getResults(): any[] {
    return this.Results;
  }

  public getResultsData(): any[] {
    return this.Results.map(result => result.data);
  }

  public getSimpleVO(): SimpleVO {
    return this.getResultsData()[0][0].SimpleVO;
  }

  public messageIncludes(exact: string): Boolean {
    return this.Results[0].message.indexOf(exact) > -1;
  }

  public messageIncludesPhrase(phrase: string): Boolean {
    for (let i = 0; i < this.Results[0].message; i++) {
      if (this.Results[0].message[i].includes(phrase)) {
        return true;
      }
    }
  }

  public setData(data: any[]) {
    if (!this.Results) {
      this.Results = [{}];
    }

    this.Results[0].data = data;
  }

  public setMessage(message: string[]) {
    if (!this.Results) {
      this.Results = [{}];
    }

    this.Results[0].message = message;
  }
}

export class BaseRepo {
  constructor(public http: HttpService) { }

}
