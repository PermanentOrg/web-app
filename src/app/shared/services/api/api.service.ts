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
  public locn: Repo.LocnRepo;
  public publish: Repo.PublishRepo;
  public record: Repo.RecordRepo;
  public relation: Repo.RelationRepo;
  public search: Repo.SearchRepo;
  public share: Repo.ShareRepo;
  public system: Repo.SystemRepo;
  public tag: Repo.TagRepo;

  constructor(private http: HttpService) {
    this.auth = new Repo.AuthRepo(this.http);
    this.account = new Repo.AccountRepo(this.http);
    this.archive = new Repo.ArchiveRepo(this.http);
    this.billing = new Repo.BillingRepo(this.http);
    this.connector = new Repo.ConnectorRepo(this.http);
    this.folder = new Repo.FolderRepo(this.http);
    this.invite = new Repo.InviteRepo(this.http);
    this.locn = new Repo.LocnRepo(this.http);
    this.publish = new Repo.PublishRepo(this.http);
    this.record = new Repo.RecordRepo(this.http);
    this.relation = new Repo.RelationRepo(this.http);
    this.search = new Repo.SearchRepo(this.http);
    this.share = new Repo.ShareRepo(this.http);
    this.system = new Repo.SystemRepo(this.http);
    this.tag = new Repo.TagRepo(this.http);
  }
}
