import { AccountVO, ArchiveVO, Directive, LegacyContact } from '@models/index';
import { BaseRepo } from './base';

export class DirectiveRepo extends BaseRepo {
  public async get(archive: ArchiveVO): Promise<Directive> {
    console.warn('Directive API is currently unimplemented.');
    return {} as Directive;
  }

  public async getLegacyContact(account: AccountVO): Promise<LegacyContact> {
    console.warn('Directive API is currently unimplemented.');
    return {} as LegacyContact;
  }
}
