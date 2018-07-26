import { Injectable } from '@angular/core';
import { HttpService } from '@shared/services/http/http.service';
import * as Repo from '@shared/services/api/index.repo';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public auth: Repo.AuthRepo;
  public account: Repo.AccountRepo;
  public archive: Repo.ArchiveRepo;
  public folder: Repo.FolderRepo;
  public record: Repo.RecordRepo;
  public connector: Repo.ConnectorRepo;

  constructor(private http: HttpService) {
    this.auth = new Repo.AuthRepo(this.http);
    this.account = new Repo.AccountRepo(this.http);
    this.archive = new Repo.ArchiveRepo(this.http);
    this.folder = new Repo.FolderRepo(this.http);
    this.record = new Repo.RecordRepo(this.http);
    this.connector = new Repo.ConnectorRepo(this.http);
  }
}
