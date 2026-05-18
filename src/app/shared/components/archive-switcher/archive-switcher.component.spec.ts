import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { ArchiveVO } from '@root/app/models';
import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { ArchiveSwitcherComponent } from './archive-switcher.component';

@Component({
	selector: 'pr-archive-small',
	template: '',
	standalone: true,
})
class MockArchiveSmallComponent {}

@Component({
	selector: 'pr-basic-loading-spinner',
	template: '',
	standalone: true,
})
class MockLoadingSpinnerComponent {}

const currentArchiveData = { archiveId: '123', fullName: 'Current Archive' };
const otherArchiveData = { archiveId: '456', fullName: 'Other Archive' };

describe('ArchiveSwitcherComponent', () => {
	let component: ArchiveSwitcherComponent;
	let fixture: ComponentFixture<ArchiveSwitcherComponent>;
	let mockAccountService: jasmine.SpyObj<AccountService>;
	let mockDialogRef: { close: jasmine.Spy };
	let mockApiService: any;
	let mockPromptService: { promptButtons: jasmine.Spy; prompt: jasmine.Spy };
	let mockMessageService: { showError: jasmine.Spy };
	let mockPrConstants: { translate: jasmine.Spy };

	beforeEach(async () => {
		mockAccountService = jasmine.createSpyObj('AccountService', [
			'getArchive',
			'refreshArchives',
			'setArchive',
			'changeArchive',
		]);
		mockAccountService.getArchive.and.returnValue(
			new ArchiveVO(currentArchiveData),
		);
		mockAccountService.refreshArchives.and.returnValue(
			Promise.resolve([
				new ArchiveVO(currentArchiveData),
				new ArchiveVO(otherArchiveData),
			]),
		);
		mockAccountService.setArchive.and.stub();
		mockAccountService.changeArchive.and.returnValue(
			Promise.resolve(new ArchiveVO(otherArchiveData)),
		);

		mockDialogRef = { close: jasmine.createSpy('close') };

		mockApiService = {
			archive: {
				get: jasmine.createSpy('get').and.returnValue(
					Promise.resolve({
						getArchiveVO: () =>
							new ArchiveVO({ archiveId: '789', fullName: 'New Archive' }),
					}),
				),
				accept: jasmine.createSpy('accept').and.returnValue(Promise.resolve()),
				create: jasmine.createSpy('create').and.returnValue(
					Promise.resolve({
						getArchiveVO: () =>
							new ArchiveVO({ archiveId: '789', fullName: 'New Archive' }),
					}),
				),
			},
		};

		mockPromptService = {
			promptButtons: jasmine
				.createSpy('promptButtons')
				.and.returnValue(Promise.resolve('switch')),
			prompt: jasmine.createSpy('prompt').and.returnValue(
				Promise.resolve({
					fullName: 'New Archive',
					type: 'type.archive.person',
				}),
			),
		};

		mockMessageService = { showError: jasmine.createSpy('showError') };
		mockPrConstants = {
			translate: jasmine.createSpy('translate').and.returnValue('Owner'),
		};

		await TestBed.configureTestingModule({
			declarations: [ArchiveSwitcherComponent],
			imports: [MockArchiveSmallComponent, MockLoadingSpinnerComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: DialogRef, useValue: mockDialogRef },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: PrConstantsService, useValue: mockPrConstants },
				{ provide: PromptService, useValue: mockPromptService },
				{ provide: MessageService, useValue: mockMessageService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveSwitcherComponent);
		component = fixture.componentInstance;
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	describe('ngOnInit', () => {
		it('should load all archives including the current one', fakeAsync(() => {
			component.ngOnInit();
			tick();

			expect(mockAccountService.refreshArchives).toHaveBeenCalled();
			expect(component.archives.length).toBe(2);
			expect(component.archivesLoading).toBeFalse();
		}));

		it('should update and re-set the current archive from the fetched list', fakeAsync(() => {
			component.ngOnInit();
			tick();

			expect(mockAccountService.setArchive).toHaveBeenCalledWith(
				component.currentArchive,
			);
		}));

		it('should not call setArchive when current archive is not in the fetched list', fakeAsync(() => {
			mockAccountService.getArchive.and.returnValue(
				new ArchiveVO({ archiveId: '999', fullName: 'Unknown' }),
			);
			component.ngOnInit();
			tick();

			expect(mockAccountService.setArchive).not.toHaveBeenCalled();
		}));

		it('should not call DataService.setCurrentFolder', fakeAsync(() => {
			const dataServiceSpy = jasmine.createSpyObj('DataService', [
				'setCurrentFolder',
			]);
			component.ngOnInit();
			tick();

			expect(dataServiceSpy.setCurrentFolder).not.toHaveBeenCalled();
		}));
	});

	describe('archiveClick', () => {
		it('should close the dialog without a value when clicking the current archive', () => {
			const currentArchive = new ArchiveVO(currentArchiveData);
			component.currentArchive = currentArchive;

			component.archiveClick(currentArchive);

			expect(mockDialogRef.close).toHaveBeenCalledWith();
			expect(mockPromptService.promptButtons).not.toHaveBeenCalled();
		});

		it('should show a confirmation prompt when clicking a different archive', fakeAsync(() => {
			component.currentArchive = new ArchiveVO(currentArchiveData);
			const otherArchive = new ArchiveVO(otherArchiveData);
			spyOn(otherArchive, 'isPending').and.returnValue(false);

			component.archiveClick(otherArchive);
			tick();

			expect(mockPromptService.promptButtons).toHaveBeenCalled();
		}));

		it('should call changeArchive and close with "switched" on confirm', fakeAsync(() => {
			component.currentArchive = new ArchiveVO(currentArchiveData);
			const otherArchive = new ArchiveVO(otherArchiveData);
			spyOn(otherArchive, 'isPending').and.returnValue(false);
			mockPromptService.promptButtons.and.returnValue(
				Promise.resolve('switch'),
			);

			component.archiveClick(otherArchive);
			tick();

			expect(mockAccountService.changeArchive).toHaveBeenCalledWith(
				otherArchive,
			);

			expect(mockDialogRef.close).toHaveBeenCalledWith('switched');
		}));

		it('should not call changeArchive when the confirmation prompt is cancelled', fakeAsync(() => {
			component.currentArchive = new ArchiveVO(currentArchiveData);
			const otherArchive = new ArchiveVO(otherArchiveData);
			spyOn(otherArchive, 'isPending').and.returnValue(false);
			mockPromptService.promptButtons.and.returnValue(
				Promise.resolve('cancel'),
			);

			component.archiveClick(otherArchive);
			tick();

			expect(mockAccountService.changeArchive).not.toHaveBeenCalled();
			expect(mockDialogRef.close).not.toHaveBeenCalled();
		}));

		it('should call accept before changeArchive for a pending archive', fakeAsync(() => {
			component.currentArchive = new ArchiveVO(currentArchiveData);
			const pendingArchive = new ArchiveVO({
				archiveId: '789',
				fullName: 'Pending Archive',
			});
			spyOn(pendingArchive, 'isPending').and.returnValue(true);
			mockPromptService.promptButtons.and.returnValue(
				Promise.resolve('switch'),
			);

			component.archiveClick(pendingArchive);
			tick();

			expect(mockApiService.archive.accept).toHaveBeenCalledWith(
				pendingArchive,
			);

			expect(mockAccountService.changeArchive).toHaveBeenCalledWith(
				pendingArchive,
			);

			expect(mockDialogRef.close).toHaveBeenCalledWith('switched');
		}));

		it('should show an error message when changeArchive fails', fakeAsync(() => {
			component.currentArchive = new ArchiveVO(currentArchiveData);
			const otherArchive = new ArchiveVO(otherArchiveData);
			spyOn(otherArchive, 'isPending').and.returnValue(false);
			mockPromptService.promptButtons.and.returnValue(
				Promise.resolve('switch'),
			);
			mockAccountService.changeArchive.and.returnValue(
				Promise.reject({
					getMessage: () => 'Switch failed',
				}) as Promise<ArchiveVO>,
			);

			component.archiveClick(otherArchive);
			tick();

			expect(mockMessageService.showError).toHaveBeenCalledWith({
				message: 'Switch failed',
				translate: true,
			});

			expect(mockDialogRef.close).not.toHaveBeenCalled();
		}));
	});

	describe('cancelClick', () => {
		it('should close the dialog with "cancel"', () => {
			component.cancelClick();

			expect(mockDialogRef.close).toHaveBeenCalledWith('cancel');
		});

		it('should trigger cancelClick when the close button is clicked', () => {
			spyOn(component, 'cancelClick');
			fixture.detectChanges();

			const closeButton = fixture.nativeElement.querySelector(
				'.archive-list-close',
			);
			closeButton.click();

			expect(component.cancelClick).toHaveBeenCalled();
		});

		it('should trigger cancelClick when the Cancel text button is clicked', () => {
			spyOn(component, 'cancelClick');
			fixture.detectChanges();

			const cancelButton =
				fixture.nativeElement.querySelector('.cancel-button');
			cancelButton.click();

			expect(component.cancelClick).toHaveBeenCalled();
		});
	});

	describe('template', () => {
		it('should show loading spinner when archivesLoading is true', () => {
			component.archivesLoading = true;
			fixture.detectChanges();

			const spinner = fixture.nativeElement.querySelector(
				'pr-basic-loading-spinner',
			);

			expect(spinner).toBeTruthy();
		});

		it('should show empty message when no archives and not loading', () => {
			component.archives = [];
			component.archivesLoading = false;
			fixture.detectChanges();

			const emptyMessage =
				fixture.nativeElement.querySelector('.archives-empty');

			expect(emptyMessage.textContent).toContain('You have no other archives');
		});

		it('should render one row per archive', () => {
			component.archives = [
				new ArchiveVO({ archiveId: '1', fullName: 'Archive One' }),
				new ArchiveVO({ archiveId: '2', fullName: 'Archive Two' }),
			];
			component.archivesLoading = false;
			fixture.detectChanges();

			const rows = fixture.nativeElement.querySelectorAll('.archive-list-row');

			expect(rows.length).toBe(2);
		});

		it('should apply archive-list-row--current to the current archive row', () => {
			const currentArchiveId = mockAccountService.getArchive().archiveId;
			component.currentArchive = new ArchiveVO({
				archiveId: currentArchiveId,
				fullName: 'Current Archive',
			});
			component.archives = [
				new ArchiveVO({
					archiveId: currentArchiveId,
					fullName: 'Current Archive',
				}),
				new ArchiveVO({ archiveId: '456', fullName: 'Other Archive' }),
			];
			component.archivesLoading = false;
			fixture.detectChanges();

			const rows = fixture.nativeElement.querySelectorAll('.archive-list-row');

			expect(rows[0].classList).toContain('archive-list-row--current');
			expect(rows[1].classList).not.toContain('archive-list-row--current');
		});

		it('should call createArchiveClick when the create button is clicked', () => {
			spyOn(component, 'createArchiveClick');
			fixture.detectChanges();

			const buttons = fixture.nativeElement.querySelectorAll(
				'.archive-list-button button',
			);
			buttons[0].click();

			expect(component.createArchiveClick).toHaveBeenCalled();
		});
	});
});
