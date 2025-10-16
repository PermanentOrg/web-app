import { Subject } from 'rxjs';
import { ArchiveVO, ShareByUrlVO } from '@models/index';
import { ShareLink } from '@root/app/share-links/models/share-link';
import { Expiration } from '@root/app/share-links/services/share-link-mapping.service';

export class MockAccountService {
	public archiveChange = new Subject();

	public getArchive = () => new ArchiveVO({});
}
export class MockShareLinksApiService {
	public static readonly initialData = {
		defaultAccessRole: 'access.role.viewer',
		createdDT: '2023-02-15T20:31:36',
		previewToggle: 1,
		shareUrl: 'https://example.com/shareUrl',
		status: 'status.generic.ok',
	};
	public static shareByUrlVO: ShareByUrlVO = new ShareByUrlVO(
		MockShareLinksApiService.initialData,
	);

	public static mockShareLink: ShareLink = {
		id: '1',
		itemId: '1',
		itemType: 'record',
		token: 'example.com/test-token',
		permissionsLevel: 'viewer',
		accessRestrictions: 'none',
		maxUses: null,
		usesExpended: null,
		expirationTimestamp: null,
		createdAt: new Date('2023-02-15T20:31:36'),
		updatedAt: new Date('2023-02-15T20:31:36'),
	};

	public share = {
		generateShareLink: async () => ({
			getShareByUrlVO: () => MockShareLinksApiService.shareByUrlVO,
		}),
		updateShareLink: async (shareLink: ShareByUrlVO) => {
			MockShareLinksApiService.shareByUrlVO = shareLink;
			return MockShareLinksApiService.shareByUrlVO;
		},
		removeShareLink: async (_shareLink: ShareByUrlVO) => {
			MockShareLinksApiService.reset();
		},
	};

	// Mock for ShareLinksApiService methods
	public generateShareLink = async ({
		itemId,
		itemType,
	}: {
		itemId: string;
		itemType: 'record' | 'folder';
	}): Promise<ShareLink> => MockShareLinksApiService.mockShareLink;

	public updateShareLink = async (
		shareLinkId: string,
		payload: Partial<ShareLink>,
	): Promise<ShareLink> => {
		MockShareLinksApiService.mockShareLink = {
			...MockShareLinksApiService.mockShareLink,
			...payload,
		};
		return MockShareLinksApiService.mockShareLink;
	};

	public deleteShareLink = async (shareLinkId: string): Promise<void> => {
		MockShareLinksApiService.reset();
	};

	public static reset(): void {
		MockShareLinksApiService.shareByUrlVO = new ShareByUrlVO(
			MockShareLinksApiService.initialData,
		);
		MockShareLinksApiService.mockShareLink = {
			id: '1',
			itemId: '1',
			itemType: 'record',
			token: 'example.com/test-token',
			permissionsLevel: 'viewer',
			accessRestrictions: 'none',
			maxUses: null,
			usesExpended: null,
			expirationTimestamp: null,
			createdAt: new Date('2023-02-15T20:31:36'),
			updatedAt: new Date('2023-02-15T20:31:36'),
		};
	}
}
export class MockRelationshipService {
	public update = async () => {};
}
export class MockPromptService {
	public async confirm() {}
}
export class MockShareLinkMappingService {
	public calculateAccessRestrictions = (
		linkType: string,
		autoApprove: number,
	) => {
		if (linkType === 'public') {
			return 'none';
		}
		return 'restricted';
	};

	public getExpirationFromExpirationTimestamp = (
		expirationTimestamp: Date,
		createdAt: Date,
	): Expiration => {
		if (!expirationTimestamp) {
			return Expiration.Never;
		}
		return Expiration.Never;
	};

	public getExpiresDTFromExpiration = (
		expiration: Expiration,
		createdAt: Date,
	): string | null => {
		if (expiration === Expiration.Never) {
			return null;
		}
		return '2024-01-01T00:00:00';
	};
}
export class MockFeatureFlagService {
	public isEnabled = (flag: string): boolean => false;
}
export class MockGoogleAnalyticsService {
	public sendEvent = (params: any): void => {
		// No-op for tests
	};
}
export class NullDependency {}
