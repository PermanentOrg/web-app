import { Subject } from 'rxjs';
import { ArchiveVO } from '@models/index';
import { ShareLink } from '@root/app/share-links/models/share-link';

export class MockAccountService {
	public archiveChange = new Subject();

	public getArchive = () => new ArchiveVO({});
}
export class MockApiService {
	public static readonly initialData = {
		id: '1234',
		itemId: '5',
		itemType: 'record' as 'record' | 'folder',
		token: 'sharetoken',
		permissionsLevel: 'viewer' as
			| 'contributor'
			| 'editor'
			| 'manager'
			| 'owner'
			| 'viewer',
		accessRestrictions: 'none' as 'account' | 'approval' | 'none',
		maxUses: null,
		usesExpended: null,
		createdAt: new Date('2023-02-15T20:31:36'),
		updatedAt: new Date('2023-02-15T20:32:38'),
	};

	public static shareLink: ShareLink = MockApiService.initialData;

	public share = {
		generateShareLink: async () => ({
			generateShareLink: () => MockApiService.shareLink,
		}),
		updateShareLink: async (shareLink: ShareLink) => {
			MockApiService.shareLink = shareLink;
			return MockApiService.shareLink;
		},
		removeShareLink: async (_shareLink: ShareLink) => {
			MockApiService.reset();
		},
	};

	public async getShareLinksById(ids: number[]): Promise<ShareLink[]> {
		return [MockApiService.shareLink];
	}

	public static reset(): void {
		MockApiService.shareLink = MockApiService.initialData;
	}
}
export class MockRelationshipService {
	public update = async () => {};
}
export class MockPromptService {
	public async confirm() {}
}
export class NullDependency {}
