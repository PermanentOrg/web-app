import { ActivatedRoute, Router } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolderVO } from '@root/app/models';
import { SearchService } from '@search/services/search.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
	provideHttpClient,
	withInterceptorsFromDi,
} from '@angular/common/http';
import { GetThumbnailPipe } from '@shared/pipes/get-thumbnail.pipe';
import { DataService } from '../../../shared/services/data/data.service';
import { PublicSearchResultsComponent } from './public-search-results.component';

describe('PublicSearchResultsComponent', () => {
	let component: PublicSearchResultsComponent;
	let fixture: ComponentFixture<PublicSearchResultsComponent>;
	let mockRouter: Router;
	let mockSearchService: SearchService;
	const mockActivatedRoute = {
		parent: {},
	} as any;

	beforeEach(async () => {
		mockRouter = jasmine.createSpyObj('Router', ['navigate']);
		mockSearchService = jasmine.createSpyObj('SearchService', [
			'getResultsInPublicArchive',
		]);

		await TestBed.configureTestingModule({
			declarations: [PublicSearchResultsComponent, GetThumbnailPipe],
			imports: [],
			providers: [
				{ provide: Router, useValue: mockRouter },
				{ provide: SearchService, useValue: mockSearchService },
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
				Location,
				DataService,
				provideHttpClient(withInterceptorsFromDi()),
				provideHttpClientTesting(),
			],
		}).compileComponents();

		fixture = TestBed.createComponent(PublicSearchResultsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should navigate correctly on search result click for folders', () => {
		const mockItem = new FolderVO({
			type: 'type.folder.public',
			archiveNbr: '123',
			folder_linkId: 456,
		});
		component.onSearchResultClick(mockItem);

		expect(mockRouter.navigate).toHaveBeenCalledWith(
			[mockItem.archiveNbr, mockItem.folder_linkId],
			{ relativeTo: {} as any },
		);
	});

	it('should navigate correctly on search result click for records', () => {
		const mockItem = new FolderVO({
			parentArchiveNbr: '456',
			archiveNbr: '123',
			parentFolder_linkId: 456,
		});
		component.onSearchResultClick(mockItem);

		expect(mockRouter.navigate).toHaveBeenCalledWith(
			[
				mockItem.parentArchiveNbr,
				mockItem.parentFolder_linkId,
				'record',
				mockItem.archiveNbr,
			],
			{ relativeTo: {} as any },
		);
	});
});
