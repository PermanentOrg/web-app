import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import * as Repo from './index.repo';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public auth: Repo.AuthRepo;

  constructor(private http: HttpService) {
    this.auth = new Repo.AuthRepo(this.http);
  }
}
