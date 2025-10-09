import { TestBed } from '@angular/core/testing';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { AccountService } from '@shared/services/account/account.service';
import { ArchiveVO, RecordVO, TagVO } from '@models';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiService } from '@shared/services/api/api.service';
import { EventEmitter } from '@angular/core';
import { TagsService } from './tags.service';

class MockApiService {
	public tag = new MockTagsRepo();
}
class MockTagsRepo {
	public apiCalls: number = 0;
	async getTagsByArchive(_archiveId: number) {
		this.apiCalls++;
		return {
			getTagVOsData(): TagVO[] {
				return [
					new TagVO({ tagId: 1, name: 'tagOne' }),
					new TagVO({ tagId: 2, name: 'tagTwo' }),
				];
			},
		};
	}
}

class MockAccountService {
	public archiveChange = new EventEmitter<ArchiveVO>();
	public archive = new ArchiveVO({ archiveId: 1 });

	public getArchive() {
		return this.archive;
	}
}

describe('TagsService', () => {
	let service: TagsService;
	let api: MockApiService;
	let account: MockAccountService;

	beforeEach(() => {
		api = new MockApiService();
		account = new MockAccountService();
		TestBed.configureTestingModule({
			imports: [],
			providers: [
				{
					provide: ApiService,
					useValue: api,
				},
				{
					provide: AccountService,
					useValue: account,
				},
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		});
		TestBed.inject(ApiService);
		service = TestBed.inject(TagsService);
	});

	it('should fetch tags once on creation', (done) => {
		service.getTags$().subscribe((tags) => {
			expect(tags.length).toBe(2);
			expect(api.tag.apiCalls).toBe(1);
			done();
		});
	});

	it('should fetch tags once on archive update', (done) => {
		let created = false;
		service.getTags$().subscribe((tags) => {
			if (created) {
				expect(tags.length).toBe(2);
				expect(api.tag.apiCalls).toBe(1);
				done();
			} else {
				created = true;
				api.tag.apiCalls = 0;
				account.archiveChange.next(new ArchiveVO({}));
			}
		});
	});

	it('should reset tags on archive update if no archive is set', (done) => {
		service.getTags$().subscribe(async () => {
			account.archive = undefined;
			await service.refreshTags();

			expect(service.getTags().length).toBe(0);
			done();
		});
	});

	it('should only cache tags from the current archive', () => {
		const item = new RecordVO({
			TagVOs: [
				{ tagId: 1, name: 'testOne', archiveId: 1 },
				{ tagId: 2, name: 'testTwo', archiveId: 2 },
			],
		});
		service.checkTagsOnItem(item);

		expect(service.getTags().length).toEqual(1);
	});
});
