import { Subject } from 'rxjs';
import { ArchiveVO, ShareByUrlVO } from '@models/index';

export class MockAccountService {
	public archiveChange = new Subject();

	public getArchive = () => new ArchiveVO({});
}
export class MockApiService {
	public static readonly initialData = {
		defaultAccessRole: 'access.role.viewer',
		createdDT: '2023-02-15T20:31:36',
		previewToggle: 1,
		shareUrl: 'https://example.com/shareUrl',
		status: 'status.generic.ok',
	};
	public static shareByUrlVO: ShareByUrlVO = new ShareByUrlVO(
		MockApiService.initialData,
	);

	public share = {
		generateShareLink: async () => ({
			getShareByUrlVO: () => MockApiService.shareByUrlVO,
		}),
		updateShareLink: async (shareLink: ShareByUrlVO) => {
			MockApiService.shareByUrlVO = shareLink;
			return MockApiService.shareByUrlVO;
		},
		removeShareLink: async (_shareLink: ShareByUrlVO) => {
			MockApiService.reset();
		},
	};

	public static reset(): void {
		MockApiService.shareByUrlVO = new ShareByUrlVO(MockApiService.initialData);
	}
}
export class MockRelationshipService {
	public update = async () => {};
}
export class MockPromptService {
	public async confirm() {}
}
export class NullDependency {}
