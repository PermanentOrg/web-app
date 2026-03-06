import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ApiService } from '@shared/services/api/api.service';
import { MessageService } from '@shared/services/message/message.service';
import { GuidedTourService } from '@shared/services/guided-tour/guided-tour.service';
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

		it('goes to confirm stage when a selected member has permExists', async () => {
			await setup([reimportMember]);
			component.familyMembers[0].isSelected = true;

			component.goToNextFromPeople();

			expect(component.stage).toBe('confirm');
		});

		it('goes to confirm stage when selection includes both new and previously imported members', async () => {
			await setup([newMember, reimportMember]);
			component.familyMembers[0].isSelected = true;
			component.familyMembers[1].isSelected = true;

			component.goToNextFromPeople();

			expect(component.stage).toBe('confirm');
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

	describe('confirm stage template', () => {
		beforeEach(async () => {
			await setup([newMember, reimportMember]);
			component.familyMembers[0].isSelected = true;
			component.familyMembers[1].isSelected = true;
			component.stage = 'confirm';
			fixture.detectChanges();
		});

		it('renders the confirm stage with the correct title', () => {
			const title = fixture.nativeElement.querySelector('.page-title');

			expect(title.textContent).toContain('Continue with re-import?');
		});

		it('lists all selected members', () => {
			const items = fixture.nativeElement.querySelectorAll('li');
			const names = Array.from(items).map((li: Element) =>
				li.textContent.trim(),
			);

			expect(names).toContain('Jane Doe');
			expect(names).toContain('John Doe');
		});

		it('Go Back button returns to people stage', () => {
			const goBackBtn =
				fixture.nativeElement.querySelector('.btn.btn-secondary');
			goBackBtn.click();
			fixture.detectChanges();

			expect(component.stage).toBe('people');
		});

		it('Continue button advances to memories stage', () => {
			const continueBtn =
				fixture.nativeElement.querySelector('.btn.btn-primary');
			continueBtn.click();
			fixture.detectChanges();

			expect(component.stage).toBe('memories');
		});
	});
});
