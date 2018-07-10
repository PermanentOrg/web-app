import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import { RequestVO } from '../../models/request-vo';
import { BaseResponse } from './base';

const API_URL = environment.apiUrl;
const API_KEY = environment.apiKey;

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private csrf: String;

  constructor(private http: HttpClient) {
    this.csrf = 'ass';
  }

  public sendRequest(endpoint: string, data: any[]): Observable<BaseResponse> {
    const requestVO = new RequestVO(API_KEY, this.csrf, data);
    const url = API_URL + endpoint;

    return this.http
      .post(url, {RequestVO: requestVO})
      .pipe(map((response: any) => new BaseResponse(response)));
  }
}

export { Observable };
