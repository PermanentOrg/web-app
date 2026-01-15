import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { PublicProfileService } from '@public/services/public-profile/public-profile.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ArchiveVO } from '@models/index';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PublicArchiveComponent } from './public-archive.component';

const publicProfileServiceMock = {
	publicRoot$: () => of({}),
	archive$: () => of({}),
	profileItemsDictionary$: () => of({}),
};

const mockRouter = {
	events: of(),
	url: '/test',
	navigate: jasmine.createSpy('navigate'),
};

const mockActivatedRoute = {};

describe('PublicArchiveComponent', () => {
	let fixture: ComponentFixture<PublicArchiveComponent>;
	let component: PublicArchiveComponent;

	beforeEach(async () => {
		mockRouter.navigate.calls.reset();

		await TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule],
			declarations: [PublicArchiveComponent],
			providers: [
				{ provide: PublicProfileService, useValue: publicProfileServiceMock },
				{ provide: Router, useValue: mockRouter },
				{ provide: ActivatedRoute, useValue: mockActivatedRoute },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(PublicArchiveComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should have the information hidden as default', () => {
		expect(component.showProfileInformation).toBe(false);
	});

	it('should have the information shown when the button is clicked', () => {
		const icon = fixture.nativeElement.querySelector('.icon-expand');
		icon.click();

		expect(component.showProfileInformation).toBe(true);
	});

	it('should give the correct classes when expanding the information', () => {
		const icon = fixture.nativeElement.querySelector('.icon-expand');
		icon.click();

		fixture.detectChanges();

		const archiveDescription = fixture.nativeElement.querySelector(
			'.archive-description',
		);

		expect(archiveDescription.classList).toContain('archive-description');
		expect(archiveDescription.classList).toContain('archive-description-show');
	});

	it('should navigate to the correct search URL on handleSearch', () => {
		component.archive = { archiveId: '123' } as any;

		component.onHandleSearch('test-query');

		expect(mockRouter.navigate).toHaveBeenCalledWith(
			['search', '123', 'test-query'],
			jasmine.any(Object),
		);
	});

	it('should navigate to the correct search-tag URL on tag click', () => {
		component.archive = new ArchiveVO({ archiveId: '123' });

		component.onTagClick({ tagId: 'example-tag-id', tagName: 'tag-name' });

		expect(mockRouter.navigate).toHaveBeenCalledWith(
			['search-tag', '123', 'example-tag-id', 'tag-name'],
			jasmine.any(Object),
		);
	});
});
