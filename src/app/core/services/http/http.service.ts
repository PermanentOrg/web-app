import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

import { RequestVO } from '../../models/request-vo';
import { BaseResponse } from '../api/base';
import { StorageService } from '../storage/storage.service';

const API_URL = environment.apiUrl;
const API_KEY = environment.apiKey;
const CSRF_KEY = 'CSRF';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private defaultResponseClass;

  constructor(private http: HttpClient, private storage: StorageService ) {
    this.defaultResponseClass = BaseResponse;
  }

  public sendRequest(endpoint: string, data = [{}], responseClass ?: any): Observable<any> {
    const requestVO = new RequestVO(API_KEY, this.storage.session.get(CSRF_KEY), data);
    const url = API_URL + endpoint;

    return this.http
      .post(url, {RequestVO: requestVO})
      .pipe(map((response: any) => {
        this.storage.session.set(CSRF_KEY, response.csrf);
        if (responseClass) {
          return new responseClass(response);
        } else {
          return new this.defaultResponseClass(response);
        }
      }));
  }
}

export { Observable };
