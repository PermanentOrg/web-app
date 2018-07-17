import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import * as Repo from './index.repo';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public auth: Repo.AuthRepo;
  public account: Repo.AccountRepo;

  constructor(private http: HttpService) {
    this.auth = new Repo.AuthRepo(this.http);
    this.account = new Repo.AccountRepo(this.http);
  }
}
