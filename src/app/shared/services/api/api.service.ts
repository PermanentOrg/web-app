/* @format */
import { Injectable } from '@angular/core';
import { HttpService } from '@shared/services/http/http.service';
import { HttpV2Service } from '@shared/services/http-v2/http-v2.service';
import * as Repo from '@shared/services/api/index.repo';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  public auth: Repo.AuthRepo;
  public account: Repo.AccountRepo;
  public archive: Repo.ArchiveRepo;
  public billing: Repo.BillingRepo;
  public connector: Repo.ConnectorRepo;
  public directive: Repo.DirectiveRepo;
  public folder: Repo.FolderRepo;
  public invite: Repo.InviteRepo;
  public locn: Repo.LocnRepo;
  public notification: Repo.NotificationRepo;
  public publish: Repo.PublishRepo;
  public record: Repo.RecordRepo;
  public relation: Repo.RelationRepo;
  public search: Repo.SearchRepo;
  public share: Repo.ShareRepo;
  public system: Repo.SystemRepo;
  public tag: Repo.TagRepo;
  public idpuser: Repo.IdPuser;

  constructor(
    private http: HttpService,
    private httpV2: HttpV2Service,
  ) {
    this.auth = new Repo.AuthRepo(this.http, this.httpV2);
    this.account = new Repo.AccountRepo(this.http, this.httpV2);
    this.archive = new Repo.ArchiveRepo(this.http, this.httpV2);
    this.billing = new Repo.BillingRepo(this.http, this.httpV2);
    this.connector = new Repo.ConnectorRepo(this.http, this.httpV2);
    this.directive = new Repo.DirectiveRepo(this.http, this.httpV2);
    this.folder = new Repo.FolderRepo(this.http, this.httpV2);
    this.invite = new Repo.InviteRepo(this.http, this.httpV2);
    this.locn = new Repo.LocnRepo(this.http, this.httpV2);
    this.notification = new Repo.NotificationRepo(this.http, this.httpV2);
    this.publish = new Repo.PublishRepo(this.http, this.httpV2);
    this.record = new Repo.RecordRepo(this.http, this.httpV2);
    this.relation = new Repo.RelationRepo(this.http, this.httpV2);
    this.search = new Repo.SearchRepo(this.http, this.httpV2);
    this.share = new Repo.ShareRepo(this.http, this.httpV2);
    this.system = new Repo.SystemRepo(this.http, this.httpV2);
    this.tag = new Repo.TagRepo(this.http, this.httpV2);
    this.idpuser = new Repo.IdPuser(this.http, this.httpV2);
  }
}
