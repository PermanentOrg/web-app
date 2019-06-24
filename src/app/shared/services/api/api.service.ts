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
  public billing: Repo.BillingRepo;
  public connector: Repo.ConnectorRepo;
  public folder: Repo.FolderRepo;
  public invite: Repo.InviteRepo;
  public publish: Repo.PublishRepo;
  public record: Repo.RecordRepo;
  public relation: Repo.RelationRepo;
  public search: Repo.SearchRepo;
  public share: Repo.ShareRepo;

  constructor(private http: HttpService) {
    this.auth = new Repo.AuthRepo(this.http);
    this.account = new Repo.AccountRepo(this.http);
    this.archive = new Repo.ArchiveRepo(this.http);
    this.billing = new Repo.BillingRepo(this.http);
    this.folder = new Repo.FolderRepo(this.http);
    this.invite = new Repo.InviteRepo(this.http);
    this.publish = new Repo.PublishRepo(this.http);
    this.record = new Repo.RecordRepo(this.http);
    this.relation = new Repo.RelationRepo(this.http);
    this.search = new Repo.SearchRepo(this.http);
    this.share = new Repo.ShareRepo(this.http);
    this.connector = new Repo.ConnectorRepo(this.http);
  }
}
