import { firstValueFrom } from 'rxjs';
import { BaseRepo } from './base';

interface Method {
  methodId: string;
  method: string;
  value: string;
}

export class IdPuser extends BaseRepo {
  public getTwoFactorMethods(): Promise<Method[]> {
    return firstValueFrom(this.httpV2.get('/v2/idpuser'));
  }

  public sendEnableCode(method: string, value: string) {
    return firstValueFrom(
      this.httpV2.post('/v2/idpuser/send-enable-code', { method, value }),
    );
  }

  public enableTwoFactor(method: string, value: string, code: string) {
    return firstValueFrom(
      this.httpV2.post('/v2/idpuser/enable-two-factor', {
        method,
        value,
        code,
      }),
    );
  }

  public sendDisableCode(methodId: string) {
    return firstValueFrom(
      this.httpV2.post('/v2/idpuser/send-disable-code', { methodId }),
    );
  }

  public disableTwoFactor(methodId: string, code: string) {
    return firstValueFrom(
      this.httpV2.post('/v2/idpuser/disable-two-factor', { code, methodId }),
    );
  }
}
