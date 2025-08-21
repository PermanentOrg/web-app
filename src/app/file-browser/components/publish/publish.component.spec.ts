import { Shallow } from 'shallow-render';
import { AccountService } from '@shared/services/account/account.service';
import { FolderVO, RecordVO } from '@models/index';
import { FolderResponse } from '@shared/services/api/folder.repo';
import { Observable } from 'rxjs';
import { MessageService } from '@shared/services/message/message.service';
import { EventService } from '@shared/services/event/event.service';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ArchiveVO } from '../../../models/archive-vo';
import { FileBrowserComponentsModule } from '../../file-browser-components.module';
import { ApiService } from '../../../shared/services/api/api.service';
import { PublishComponent } from './publish.component';

const mockAccountService = {
	getArchive: () => {
		const archive = new ArchiveVO({ accessRole: 'access.role.viewer' });
		return archive;
	},
};

class MockDialogRef {
	close() {}
}

const mockApiService = {
	folder: {
		copy: (
			folderVOs: FolderVO[],
			destination: FolderVO,
		): Promise<FolderResponse> => {
			return Promise.resolve(new FolderResponse({}));
		},
		navigateLean: (folder: FolderVO): Observable<FolderResponse> => {
			return new Observable<FolderResponse>();
		},
	},
};

describe('PublishComponent', () => {
	let shallow: Shallow<PublishComponent>;
	let messageShown = false;

	beforeEach(() => {
		shallow = new Shallow(PublishComponent, FileBrowserComponentsModule)
			.mock(AccountService, mockAccountService)
			.mock(ApiService, mockApiService)
			.mock(DIALOG_DATA, {
				item: { folder_linkType: 'linkType' },
			})
			.provide({ provide: DialogRef, useClass: MockDialogRef })
			.provide(EventService)
			.dontMock(EventService)
			.mock(MessageService, {
				showError: () => {
					messageShown = true;
				},
			});
	});

	it('should create', async () => {
		const { instance } = await shallow.render();

		expect(instance).toBeTruthy();
	});

	it('should disaple the public to internet archive button if the user does not have the correct access role', async () => {
		const { instance, find, fixture } = await shallow.render();
		instance.publicItem = new RecordVO({ recordId: 1 });
		instance.publishIa = null;
		instance.publicLink = null;

		fixture.detectChanges();

		const button = find('.publish-to-archive');

		expect(button.nativeElement.disabled).toBeTruthy();
	});
});
