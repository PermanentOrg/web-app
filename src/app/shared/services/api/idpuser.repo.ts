import { firstValueFrom } from 'rxjs';
import { BaseRepo } from './base';

interface Method {
  id: string;
  method: string;
  value: string;
}

export class IdPuser extends BaseRepo {
  public getTwoFactorMethods(): Promise<Method[]> {
    return firstValueFrom(this.httpV2.get('/v2/idpuser'));
  }
}
