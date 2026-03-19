import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { GuidedTourService } from '@shared/services/guided-tour/guided-tour.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { FamilySearchImportComponent } from './family-search-import.component';

describe('FamilySearchImportComponent', () => {
	let component: FamilySearchImportComponent;
	let fixture: ComponentFixture<FamilySearchImportComponent>;

	const mockDialogRef = { close: jasmine.createSpy('close') };

	const mockApiService = {
		archive: { create: jasmine.createSpy('create') },
		connector: {
			familysearchFactImportRequest: jasmine.createSpy(
				'familysearchFactImportRequest',
			),
			familysearchMemoryImportRequest: jasmine.createSpy(
				'familysearchMemoryImportRequest',
			),
		},
	};

	const mockMessageService = {
		showMessage: jasmine.createSpy('showMessage'),
		showError: jasmine.createSpy('showError'),
	};

	const mockGuidedTourService = {
		isStepComplete: jasmine.createSpy('isStepComplete').and.returnValue(true),
		startTour: jasmine.createSpy('startTour'),
		emit: jasmine.createSpy('emit'),
		markStepComplete: jasmine.createSpy('markStepComplete'),
	};

	const mockPromptService = {
		promptButtons: jasmine
			.createSpy('promptButtons')
			.and.returnValue(Promise.resolve('go-back')),
	};

	const currentUserData = {
		id: 'user-1',
		display: { name: 'Test User', lifespan: '1900–1980', ascendancyNumber: 1 },
	};

	const makeDialogData = (treeData: object[]) => ({
		currentUserData,
		treeData: treeData.map((member) => ({ ...member })),
	});

	async function setup(treeData: object[]) {
		await TestBed.configureTestingModule({
			declarations: [FamilySearchImportComponent],
			imports: [FormsModule],
			providers: [
				{ provide: DialogRef, useValue: mockDialogRef },
				{ provide: DIALOG_DATA, useValue: makeDialogData(treeData) },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: MessageService, useValue: mockMessageService },
				{ provide: GuidedTourService, useValue: mockGuidedTourService },
				{ provide: PromptService, useValue: mockPromptService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(FamilySearchImportComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}

	const newMember = {
		id: 'person-2',
		display: { name: 'Jane Doe', lifespan: '1930–2010', ascendancyNumber: 3 },
		permExists: false,
	};

	const reimportMember = {
		id: 'person-3',
		display: { name: 'John Doe', lifespan: '1928–2005', ascendancyNumber: 2 },
		permExists: true,
	};

	describe('goToNextFromPeople()', () => {
		it('goes to memories stage when no selected member has permExists', async () => {
			await setup([newMember]);
			component.familyMembers[0].isSelected = true;

			component.goToNextFromPeople();

			expect(component.stage).toBe('memories');
		});

		it('shows a confirmation prompt when a selected member has permExists', async () => {
			await setup([reimportMember]);
			component.familyMembers[0].isSelected = true;

			await component.goToNextFromPeople();

			expect(mockPromptService.promptButtons).toHaveBeenCalledWith(
				jasmine.arrayContaining([
					jasmine.objectContaining({ buttonName: 'go-back' }),
					jasmine.objectContaining({ buttonName: 'continue' }),
				]),
				'Continue with re-import?',
				undefined,
				jasmine.stringContaining('John Doe'),
			);
		});

		it('shows a confirmation prompt when selection includes both new and previously imported members', async () => {
			await setup([newMember, reimportMember]);
			component.familyMembers[0].isSelected = true;
			component.familyMembers[1].isSelected = true;

			await component.goToNextFromPeople();

			expect(mockPromptService.promptButtons).toHaveBeenCalled();
		});

		it('goes to memories stage when user confirms reimport', async () => {
			await setup([reimportMember]);
			component.familyMembers[0].isSelected = true;
			mockPromptService.promptButtons.and.returnValue(
				Promise.resolve('continue'),
			);

			await component.goToNextFromPeople();

			expect(component.stage).toBe('memories');
		});

		it('stays on people stage when user dismisses reimport confirmation', async () => {
			await setup([reimportMember]);
			component.familyMembers[0].isSelected = true;
			mockPromptService.promptButtons.and.returnValue(
				Promise.resolve('go-back'),
			);

			await component.goToNextFromPeople();

			expect(component.stage).toBe('people');
		});

		it('goes to memories stage when a member with permExists is not selected', async () => {
			await setup([newMember, reimportMember]);
			component.familyMembers[0].isSelected = true;
			// reimportMember not selected

			component.goToNextFromPeople();

			expect(component.stage).toBe('memories');
		});
	});

	describe('getSelectedMembers()', () => {
		it('returns only selected members', async () => {
			await setup([newMember, reimportMember]);
			component.familyMembers[0].isSelected = true;

			const selected = component.getSelectedMembers();

			expect(selected.length).toBe(1);
			expect(selected[0].display.name).toBe('Jane Doe');
		});

		it('returns all members when all are selected', async () => {
			await setup([newMember, reimportMember]);
			component.familyMembers[0].isSelected = true;
			component.familyMembers[1].isSelected = true;

			expect(component.getSelectedMembers().length).toBe(2);
		});

		it('returns empty array when no members are selected', async () => {
			await setup([newMember, reimportMember]);

			expect(component.getSelectedMembers().length).toBe(0);
		});
	});
});
