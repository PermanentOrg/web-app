import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountService } from '@shared/services/account/account.service';
import { FolderVO, RecordVO } from '@models/index';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { Observable } from 'rxjs';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Router } from '@angular/router';
import { ArchiveVO } from '../../../models/archive-vo';
import { ApiService } from '../../../shared/services/api/api.service';
import { PublishComponent } from './publish.component';

const mockAccountService = {
	getArchive: () => {
		const archive = new ArchiveVO({ accessRole: 'access.role.viewer' });
		return archive;
	},
	getRootFolder: () => ({
		ChildItemVOs: [],
	}),
	refreshAccountDebounced: () => {},
};

class MockDialogRef {
	close() {}
}

const mockApiService = {
	folder: {
		copy: async (
			folderVOs: FolderVO[],
			destination: FolderVO,
		): Promise<FolderResponse> => await Promise.resolve(new FolderResponse({})),
		navigateLean: (folder: FolderVO): Observable<FolderResponse> =>
			new Observable<FolderResponse>(),
	},
	publish: {
		getInternetArchiveLink: async () => ({
			getPublishIaVO: () => null,
		}),
		publishToInternetArchive: async () => ({
			getPublishIaVO: () => null,
		}),
	},
	record: {
		copy: async () => ({
			getRecordVO: () => new RecordVO({}),
		}),
	},
};

describe('PublishComponent', () => {
	let component: PublishComponent;
	let fixture: ComponentFixture<PublishComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [PublishComponent],
			providers: [
				{ provide: AccountService, useValue: mockAccountService },
				{ provide: ApiService, useValue: mockApiService },
				{
					provide: DIALOG_DATA,
					useValue: {
						item: { folder_linkType: 'linkType' },
					},
				},
				{ provide: DialogRef, useClass: MockDialogRef },
				EventService,
				{
					provide: MessageService,
					useValue: {
						showError: () => {},
					},
				},
				{
					provide: Router,
					useValue: {
						navigate: () => {},
					},
				},
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PublishComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should disaple the public to internet archive button if the user does not have the correct access role', () => {
		component.publicItem = new RecordVO({ recordId: 1 });
		component.publishIa = null;
		component.publicLink = null;

		fixture.detectChanges();

		const button = fixture.nativeElement.querySelector('.publish-to-archive');

		expect(button.disabled).toBeTruthy();
	});
});
