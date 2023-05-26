import { AccountVO } from '@models/account-vo';
import { LegacyContact } from '@models/directive';

export class MockDirectiveRepo {
  public static legacyContactName: string;
  public static legacyContactEmail: string;
  public static throwError: boolean = false;

  public static reset(): void {
    MockDirectiveRepo.legacyContactEmail = undefined;
    MockDirectiveRepo.legacyContactName = undefined;
    MockDirectiveRepo.throwError = false;
  }

  public async getLegacyContact(_account: AccountVO): Promise<LegacyContact> {
    if (MockDirectiveRepo.throwError) {
      throw new Error('Forced Unit Testing Error');
    }
    if (
      !MockDirectiveRepo.legacyContactName &&
      !MockDirectiveRepo.legacyContactEmail
    ) {
      return;
    }
    return {
      name: MockDirectiveRepo.legacyContactName,
      email: MockDirectiveRepo.legacyContactEmail,
    };
  }
}

export class MockApiService {
  public directive = new MockDirectiveRepo();
}
