import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@root/environments/environment';

import { RequestVO } from '@models/request-vo';
import { BaseResponse } from '@shared/services/api/base';
import { StorageService } from '@shared/services/storage/storage.service';

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

  public sendRequest<T = BaseResponse>(endpoint: string, data: any = [{}], responseClass ?: any): Observable<T> {
    const requestVO = new RequestVO(API_KEY, this.storage.session.get(CSRF_KEY), data);
    const url = API_URL + endpoint;

    return this.http
      .post(url, {RequestVO: requestVO})
      .pipe(map((response: any) => {
        if (response) {
          this.storage.session.set(CSRF_KEY, JSON.stringify(response.csrf));
        }
        if (responseClass) {
          return new responseClass(response);
        } else {
          return new this.defaultResponseClass(response);
        }
      }));
  }

  public sendRequestPromise<T = BaseResponse>(endpoint: string, data: any = [{}], responseClass ?: any): Promise<T> {
    return this.sendRequest(endpoint, data, responseClass)
      .pipe(map((response: any | BaseResponse) => {
        if (!response.isSuccessful) {
          throw response;
        }

        return response;
      })).toPromise();
  }
}

export { Observable };
