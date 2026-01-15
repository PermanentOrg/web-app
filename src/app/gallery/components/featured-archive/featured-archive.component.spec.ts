import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ArchiveType } from '@models/archive-vo';
import { FeaturedArchive } from '../../types/featured-archive';
import { FeaturedArchiveComponent } from './featured-archive.component';

@Pipe({ name: 'archiveTypeName', standalone: false })
class MockArchiveTypeNamePipe implements PipeTransform {
	transform(value: string): string {
		return value?.replace('type.archive.', '') || '';
	}
}

const testArchive: FeaturedArchive = {
	archiveNbr: '0000-0000',
	name: 'Unit Testing',
	type: 'type.archive.person',
	profileImage: 'thumbUrl',
	bannerImage: 'bannerUrl',
};

describe('FeaturedArchiveComponent', () => {
	let fixture: ComponentFixture<FeaturedArchiveComponent>;
	let component: FeaturedArchiveComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [FeaturedArchiveComponent, MockArchiveTypeNamePipe],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(FeaturedArchiveComponent);
		component = fixture.componentInstance;
		component.archive = testArchive;
		fixture.detectChanges();
	});

	it('should exist', () => {
		expect(component).toBeTruthy();
	});

	it('should include all archive information', () => {
		const profilePicImg =
			fixture.nativeElement.querySelector('.profile-pic img');

		expect(profilePicImg.src).toContain('thumbUrl');
		expect(fixture.nativeElement.innerText).toContain(
			'The Unit Testing Archive',
		);
	});

	it('should be able to get proper classnames', () => {
		function expectClassnameForArchiveType(
			archiveType: ArchiveType,
			expectedClassname: string,
		) {
			component.archive.type = archiveType;
			component.ngOnInit();

			expect(component.classNames).toContain(expectedClassname);
		}

		expectClassnameForArchiveType('type.archive.person', 'personal');
		expectClassnameForArchiveType('type.archive.group', 'group');
		expectClassnameForArchiveType('type.archive.family', 'group');
		expectClassnameForArchiveType('type.archive.organization', 'organization');
		expectClassnameForArchiveType('type.archive.nonprofit', 'organization');
	});

	describe('Accessibility', () => {
		it('has alt text for all img tags', () => {
			const images = fixture.nativeElement.querySelectorAll('img');
			images.forEach((img: HTMLImageElement) => {
				expect(img.alt).toBeDefined();
			});
		});

		it('has specific label text for each link', () => {
			const link = fixture.nativeElement.querySelector('a');

			expect(link.getAttribute('aria-label')).toContain('Unit Testing');
		});
	});
});
