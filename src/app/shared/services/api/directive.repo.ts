import { ArchiveVO, Directive } from '@models/index';
import { BaseRepo } from './base';

export class DirectiveRepo extends BaseRepo {
  public async get(archive: ArchiveVO): Promise<Directive> {
    console.warn('Directive API is currently unimplemented.');
    return {} as Directive;
  }
}
