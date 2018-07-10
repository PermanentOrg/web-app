import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import { RequestVO } from '../../models/request-vo';
import { BaseResponse } from '../api/base';
import { SessionService } from '../session/session.service';

const API_URL = environment.apiUrl;
const API_KEY = environment.apiKey;

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient, private session: SessionService ) { }

  public sendRequest(endpoint: string, data = [{}]): Observable<BaseResponse> {
    const requestVO = new RequestVO(API_KEY, this.session.get('csrf'), data);
    const url = API_URL + endpoint;

    return this.http
      .post(url, {RequestVO: requestVO})
      .pipe(map((response: any) => {
        const baseResponse = new BaseResponse(response);
        this.session.set('csrf', baseResponse.csrf);
        return baseResponse;
      }));
  }
}

export { Observable };
