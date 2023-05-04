import {
  AccountVO,
  ArchiveVO,
  DirectiveData,
  DirectiveCreateRequest,
  LegacyContact,
  Directive,
} from '@models/index';
import { BaseRepo } from './base';
import { getFirst } from '../http-v2/http-v2.service';

export class DirectiveRepo extends BaseRepo {
  public async get(archive: ArchiveVO): Promise<Directive> {
    return getFirst(
      this.httpV2.get(
        `/v2/directive/archive/${archive.archiveId}`,
        {},
        Directive
      )
    ).toPromise();
  }

  public async getLegacyContact(account: AccountVO): Promise<LegacyContact> {
    console.warn('Legacy Contact API is currently unimplemented.');
    return {} as LegacyContact;
  }

  public async create(directive: DirectiveCreateRequest): Promise<Directive> {
    return getFirst(
      this.httpV2.post('/v2/directive', directive, Directive)
    ).toPromise();
  }

  public async update(directive: Partial<DirectiveData>): Promise<Directive> {
    if (!directive.directiveId) {
      throw new Error(
        'directiveID is required to update an existing Directive.'
      );
    }
    const data = Object.assign({}, directive);
    delete data.directiveId;
    return getFirst(
      this.httpV2.put(`/v2/directive/${directive.directiveId}`, data, Directive)
    ).toPromise();
  }
}
