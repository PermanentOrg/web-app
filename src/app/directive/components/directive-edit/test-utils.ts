import { HttpErrorResponse } from '@angular/common/http';
import { DirectiveData, DirectiveCreateRequest } from '@models/directive';
import { MockDirectiveRepo as DirectiveGetRepo } from '../directive-display/test-utils';

export const createDirective = (email: string, note: string) => {
	DirectiveGetRepo.reset();
	const repo = new DirectiveGetRepo();
	DirectiveGetRepo.mockStewardEmail = email;
	DirectiveGetRepo.mockNote = note;

	return repo.createDirective();
};

export class MockMessageService {
	public static errorShown: boolean = false;

	public static reset(): void {
		MockMessageService.errorShown = false;
	}

	public showError(_msg: string): void {
		MockMessageService.errorShown = true;
	}
}

export class MockDirectiveRepo {
	public static createdDirective: DirectiveData = null;
	public static editedDirective: Partial<DirectiveData> = null;
	public static failRequest: boolean = false;
	public static errorDelay: number = 0;
	public static accountExists: boolean = true;

	public static reset(): void {
		MockDirectiveRepo.createdDirective = null;
		MockDirectiveRepo.editedDirective = null;
		MockDirectiveRepo.failRequest = false;
		MockDirectiveRepo.errorDelay = 0;
		MockDirectiveRepo.accountExists = true;
	}

	public async create(
		directive: DirectiveCreateRequest,
	): Promise<DirectiveData> {
		if (MockDirectiveRepo.failRequest) {
			await new Promise((resolve) =>
				setTimeout(resolve, MockDirectiveRepo.errorDelay),
			);
			throw new Error('Forced Unit Test Error');
		}
		if (!MockDirectiveRepo.accountExists) {
			return new HttpErrorResponse({
				error: {
					message: 'Steward account not found',
				},
				status: 404,
				statusText: 'Steward account not found',
			}) as any as DirectiveData;
			// Simulate returning an unexpected error from the HttpClient
		}
		const testDirectiveId = '39b2a5fa-3508-4030-91b6-21dc6ec7a1ab';
		const newDirective: DirectiveData = {
			directiveId: testDirectiveId,
			archiveId: parseInt(directive.archiveId.toString(), 10),
			type: directive.type,
			createdDt: new Date(),
			updatedDt: new Date(),
			trigger: {
				directiveTriggerId: testDirectiveId,
				directiveId: testDirectiveId,
				type: directive.trigger.type,
				createdDt: new Date(),
				updatedDt: new Date(),
			},
			steward: {
				email: directive.stewardEmail,
				name: '',
			},
			note: directive.note,
			executionDt: null,
		};
		MockDirectiveRepo.createdDirective = newDirective;
		return newDirective;
	}

	public async update(
		directive: Partial<DirectiveData>,
	): Promise<DirectiveData> {
		if (MockDirectiveRepo.failRequest) {
			await new Promise((resolve) =>
				setTimeout(resolve, MockDirectiveRepo.errorDelay),
			);
			throw new Error('Forced Unit Test Error');
		}
		if (!MockDirectiveRepo.accountExists) {
			return new HttpErrorResponse({
				error: {
					message: 'Steward account not found',
				},
				status: 404,
				statusText: 'Steward account not found',
			}) as any as DirectiveData;
			// Simulate returning an unexpected error from the HttpClient
		}
		MockDirectiveRepo.editedDirective = directive;
		return directive as DirectiveData;
	}
}
