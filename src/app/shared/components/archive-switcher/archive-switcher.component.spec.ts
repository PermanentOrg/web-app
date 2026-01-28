import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { ApiService } from '@shared/services/api/api.service';
import { DataService } from '@shared/services/data/data.service';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';
import { PromptService } from '@shared/services/prompt/prompt.service';
import { MessageService } from '@shared/services/message/message.service';
import { Router } from '@angular/router';
import { ArchiveVO, FolderVO } from '@root/app/models';
import { Component } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { ArchiveSwitcherComponent } from './archive-switcher.component';

@Component({
	selector: 'pr-archive-small',
	template: '',
	standalone: true, // ✅ This makes it standalone
})
class MockArchiveSmallComponent {}

@Component({
	selector: 'pr-basic-loading-spinner',
	template: '',
	standalone: true,
})
class MockLoadingSpinnerComponent {}

describe('ArchiveSwitcherComponent', () => {
	let component: ArchiveSwitcherComponent;
	let fixture: ComponentFixture<ArchiveSwitcherComponent>;

	const mockAccountService = {
		getArchive: jasmine
			.createSpy()
			.and.returnValue(
				new ArchiveVO({ archiveId: '123', fullName: 'Current Archive' }),
			),
		refreshArchives: jasmine.createSpy().and.returnValue(
			Promise.resolve([
				{ archiveId: '123', fullName: 'Current Archive' },
				{ archiveId: '456', fullName: 'Other Archive' },
			]),
		),
		setArchive: jasmine.createSpy(),
		changeArchive: jasmine.createSpy().and.returnValue(Promise.resolve()),
	};

	const mockDialogRef = {
		close: jasmine.createSpy(),
	};

	const mockApiService = {
		archive: {
			get: jasmine.createSpy().and.returnValue(
				Promise.resolve({
					getArchiveVO: () =>
						new ArchiveVO({ archiveId: '789', fullName: 'New Archive' }),
				}),
			),
			accept: jasmine.createSpy().and.returnValue(Promise.resolve()),
			create: jasmine.createSpy().and.returnValue(
				Promise.resolve({
					getArchiveVO: () =>
						new ArchiveVO({ archiveId: '789', fullName: 'New Archive' }),
				}),
			),
		},
	};

	const mockDataService = {
		setCurrentFolder: jasmine.createSpy(),
	};

	const mockPromptService = {
		promptButtons: jasmine
			.createSpy()
			.and.returnValue(Promise.resolve('switch')),
		prompt: jasmine.createSpy().and.returnValue(
			Promise.resolve({
				fullName: 'New Archive',
				type: 'type.archive.person',
			}),
		),
	};

	const mockMessageService = {
		showError: jasmine.createSpy(),
	};

	const mockRouter = {
		navigate: jasmine.createSpy(),
	};

	const mockPrConstants = {
		translate: jasmine.createSpy().and.returnValue('Translated Role'),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ArchiveSwitcherComponent],
			imports: [MockArchiveSmallComponent, MockLoadingSpinnerComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: DialogRef, useValue: mockDialogRef },
				{ provide: ApiService, useValue: mockApiService },
				{ provide: DataService, useValue: mockDataService },
				{ provide: PrConstantsService, useValue: mockPrConstants },
				{ provide: PromptService, useValue: mockPromptService },
				{ provide: MessageService, useValue: mockMessageService },
				{ provide: Router, useValue: mockRouter },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ArchiveSwitcherComponent);
		component = fixture.componentInstance;
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize and load archives', fakeAsync(() => {
		component.ngOnInit();
		tick();

		expect(mockDataService.setCurrentFolder).toHaveBeenCalledWith(
			jasmine.any(FolderVO),
		);

		expect(mockAccountService.refreshArchives).toHaveBeenCalled();
		expect(component.archives.length).toBe(1);
		expect(component.archivesLoading).toBeFalse();
	}));

	it('should trigger animation in ngAfterViewInit', () => {
		const mockNodeList: NodeListOf<Element> = {
			length: 1,
			item: () => document.createElement('div'),
			0: document.createElement('div'),
			forEach: (callback) =>
				callback(document.createElement('div'), 0, mockNodeList),
		} as unknown as NodeListOf<Element>;

		spyOn(document, 'querySelectorAll').and.returnValue(mockNodeList);
		component.ngAfterViewInit();

		expect(document.querySelectorAll).toHaveBeenCalledWith(
			'.archive-list pr-archive-small',
		);
	});

	it('should handle archiveClick and switch archive', fakeAsync(() => {
		const archive = new ArchiveVO({
			archiveId: '456',
			fullName: 'Other Archive',
		});
		spyOn(archive, 'isPending').and.returnValue(false);

		component.archiveClick(archive);
		tick();

		expect(mockPromptService.promptButtons).toHaveBeenCalled();
		expect(mockAccountService.changeArchive).toHaveBeenCalledWith(archive);
		expect(mockDialogRef.close).toHaveBeenCalled();
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/private']);
	}));

	it('should handle createArchiveClick and push new archive', fakeAsync(() => {
		spyOn(component, 'archiveClick');
		component.createArchiveClick();
		tick();

		expect(mockPromptService.prompt).toHaveBeenCalled();
		expect(mockApiService.archive.create).toHaveBeenCalled();
		expect(component.archives.length).toBe(1);
		expect(component.archiveClick).toHaveBeenCalled();
	}));

	it('should show empty message when no archives and not loading', () => {
		component.archives = [];
		component.archivesLoading = false;
		fixture.detectChanges();

		const emptyMessage = fixture.nativeElement.querySelector('.archives-empty');

		expect(emptyMessage).toBeTruthy();
		expect(emptyMessage.textContent).toContain('You have no other archives');
	});

	it('should show loading spinner when archivesLoading is true', () => {
		component.archivesLoading = true;
		fixture.detectChanges();

		const spinner = fixture.nativeElement.querySelector(
			'pr-basic-loading-spinner',
		);

		expect(spinner).toBeTruthy();
	});

	it('should render archive items when archives are present', fakeAsync(() => {
		component.archives = [
			new ArchiveVO({ archiveId: '1', fullName: 'Archive One' }),
			new ArchiveVO({ archiveId: '2', fullName: 'Archive Two' }),
		];
		component.archivesLoading = false;
		fixture.detectChanges();

		const archiveItems =
			fixture.nativeElement.querySelectorAll('pr-archive-small');

		expect(archiveItems.length).toBe(2);
	}));

	it('should call createArchiveClick on button click', () => {
		spyOn(component, 'createArchiveClick');
		fixture.detectChanges();

		const buttons = fixture.nativeElement.querySelectorAll(
			'.archive-list-button button',
		);
		buttons[0].click();

		expect(component.createArchiveClick).toHaveBeenCalled();
	});

	it('should close the dialog when backButtonClick is called', () => {
		component.backButtonClick();

		expect(mockDialogRef.close).toHaveBeenCalled();
	});
});
