import { AccountVO } from '@models/account-vo';
import { LegacyContact } from '@models/directive';

export class MockDirectiveRepo {
	public static legacyContactName: string;
	public static legacyContactEmail: string;
	public static throwError: boolean = false;
	public static savedLegacyContact: LegacyContact;
	public static createdLegacyContact: boolean;
	public static updatedLegacyContact: boolean;

	public static reset(): void {
		MockDirectiveRepo.legacyContactEmail = undefined;
		MockDirectiveRepo.legacyContactName = undefined;
		MockDirectiveRepo.throwError = false;
		MockDirectiveRepo.savedLegacyContact = undefined;
		MockDirectiveRepo.createdLegacyContact = false;
		MockDirectiveRepo.updatedLegacyContact = false;
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

	public async createLegacyContact(
		legacyContact: LegacyContact,
	): Promise<LegacyContact> {
		if (MockDirectiveRepo.throwError) {
			throw new Error('Forced Unit Testing Error');
		}
		MockDirectiveRepo.savedLegacyContact = {
			legacyContactId: 'test-id',
			name: legacyContact.name,
			email: legacyContact.email,
		};
		MockDirectiveRepo.createdLegacyContact = true;
		return Object.assign({}, MockDirectiveRepo.savedLegacyContact);
	}

	public async updateLegacyContact(
		legacyContact: LegacyContact,
	): Promise<LegacyContact> {
		if (MockDirectiveRepo.throwError) {
			throw new Error('Forced Unit Testing Error');
		}
		MockDirectiveRepo.savedLegacyContact = Object.assign(
			{
				legacyContactId: 'test-id',
			},
			legacyContact,
		);
		MockDirectiveRepo.updatedLegacyContact = true;
		return Object.assign({}, MockDirectiveRepo.savedLegacyContact);
	}
}

export class MockApiService {
	public directive = new MockDirectiveRepo();
}
