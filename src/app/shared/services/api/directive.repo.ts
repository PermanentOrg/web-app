/* @format */
import {
  ArchiveVO,
  DirectiveCreateRequest,
  LegacyContact,
  Directive,
  DirectiveUpdateRequest,
} from '@models/index';
import { getFirst } from '../http-v2/http-v2.service';
import { BaseRepo } from './base';

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

  public async create(directive: DirectiveCreateRequest): Promise<Directive> {
    return getFirst(
      this.httpV2.post('/v2/directive', directive, Directive)
    ).toPromise();
  }

  public async update(directive: DirectiveUpdateRequest): Promise<Directive> {
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

  public async getLegacyContact(): Promise<LegacyContact> {
    return getFirst(
      this.httpV2.get('/v2/legacy-contact', {}, LegacyContactClass)
    ).toPromise();
  }

  public async createLegacyContact(
    legacyContact: LegacyContact
  ): Promise<LegacyContact> {
    return getFirst(
      this.httpV2.post('/v2/legacy-contact', legacyContact, LegacyContactClass)
    ).toPromise();
  }

  public async updateLegacyContact(
    legacyContact: LegacyContact
  ): Promise<LegacyContact> {
    if (!legacyContact.legacyContactId) {
      throw new Error(
        'legacyContactId is required to update an existing Legacy Contact'
      );
    }
    const data = {
      name: legacyContact.name,
      email: legacyContact.email,
    };
    return getFirst(
      this.httpV2.put(
        `/v2/legacy-contact/${legacyContact.legacyContactId}`,
        data,
        LegacyContactClass
      )
    ).toPromise();
  }
}

class LegacyContactClass implements LegacyContact {
  public name: string;
  public email: string;
  public legacyContactId: string;
  public accountId: string;

  constructor(props: Object) {
    for (const prop in props) {
      this[prop] = props[prop];
    }
  }
}
