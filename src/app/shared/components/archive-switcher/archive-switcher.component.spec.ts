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

import { vi } from 'vitest';

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
		getArchive: vi.fn()
			.mockReturnValue(
				new ArchiveVO({ archiveId: '123', fullName: 'Current Archive' }),
			),
		refreshArchives: vi.fn().mockReturnValue(
			Promise.resolve([
				{ archiveId: '123', fullName: 'Current Archive' },
				{ archiveId: '456', fullName: 'Other Archive' },
			]),
		),
		setArchive: vi.fn(),
		changeArchive: vi.fn().mockReturnValue(Promise.resolve()),
	};

	const mockDialogRef = {
		close: vi.fn(),
	};

	const mockApiService = {
		archive: {
			get: vi.fn().mockReturnValue(
				Promise.resolve({
					getArchiveVO: () =>
						new ArchiveVO({ archiveId: '789', fullName: 'New Archive' }),
				}),
			),
			accept: vi.fn().mockReturnValue(Promise.resolve()),
			create: vi.fn().mockReturnValue(
				Promise.resolve({
					getArchiveVO: () =>
						new ArchiveVO({ archiveId: '789', fullName: 'New Archive' }),
				}),
			),
		},
	};

	const mockDataService = {
		setCurrentFolder: vi.fn(),
	};

	const mockPromptService = {
		promptButtons: vi.fn()
			.mockReturnValue(Promise.resolve('switch')),
		prompt: vi.fn().mockReturnValue(
			Promise.resolve({
				fullName: 'New Archive',
				type: 'type.archive.person',
			}),
		),
	};

	const mockMessageService = {
		showError: vi.fn(),
	};

	const mockRouter = {
		navigate: vi.fn(),
	};

	const mockPrConstants = {
		translate: vi.fn().mockReturnValue('Translated Role'),
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
			expect.any(FolderVO),
		);

		expect(mockAccountService.refreshArchives).toHaveBeenCalled();
		expect(component.archives.length).toBe(1);
		expect(component.archivesLoading).toBe(false);
	}));

	it('should trigger animation in ngAfterViewInit', () => {
		const mockNodeList: NodeListOf<Element> = {
			length: 1,
			item: () => document.createElement('div'),
			0: document.createElement('div'),
			forEach: (callback) =>
				callback(document.createElement('div'), 0, mockNodeList),
		} as unknown as NodeListOf<Element>;

		vi.spyOn(document, 'querySelectorAll').mockReturnValue(mockNodeList);
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
		vi.spyOn(archive, 'isPending').mockReturnValue(false);

		component.archiveClick(archive);
		tick();

		expect(mockPromptService.promptButtons).toHaveBeenCalled();
		expect(mockAccountService.changeArchive).toHaveBeenCalledWith(archive);
		expect(mockDialogRef.close).toHaveBeenCalled();
		expect(mockRouter.navigate).toHaveBeenCalledWith(['/private']);
	}));

	it('should handle createArchiveClick and push new archive', fakeAsync(() => {
		vi.spyOn(component, 'archiveClick');
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
		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		const emptyMessage = fixture.nativeElement.querySelector('.archives-empty');

		expect(emptyMessage).toBeTruthy();
		expect(emptyMessage.textContent).toContain('You have no other archives');
	});

	it('should show loading spinner when archivesLoading is true', () => {
		component.archivesLoading = true;
		fixture.changeDetectorRef.markForCheck();
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
		fixture.changeDetectorRef.markForCheck();
		fixture.detectChanges();

		const archiveItems =
			fixture.nativeElement.querySelectorAll('pr-archive-small');

		expect(archiveItems.length).toBe(2);
	}));

	it('should call createArchiveClick on button click', () => {
		vi.spyOn(component, 'createArchiveClick');
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
