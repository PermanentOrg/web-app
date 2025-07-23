/* @format */
import { Shallow } from 'shallow-render';
import { ArchiveType } from '@models/archive-vo';
import { FeaturedArchive } from '../../types/featured-archive';
import { GalleryModule } from '../../gallery.module';
import { FeaturedArchiveComponent } from './featured-archive.component';

const testArchive: FeaturedArchive = {
	archiveNbr: '0000-0000',
	name: 'Unit Testing',
	type: 'type.archive.person',
	profileImage: 'thumbUrl',
	bannerImage: 'bannerUrl',
};

describe('FeaturedArchiveComponent', () => {
	let shallow: Shallow<FeaturedArchiveComponent>;

	const defaultRender = async () =>
		await shallow.render(
			'<pr-featured-archive [archive]="archive"></pr-featured-archive>',
			{
				bind: {
					archive: testArchive,
				},
			},
		);

	beforeEach(() => {
		shallow = new Shallow(FeaturedArchiveComponent, GalleryModule);
	});

	it('should exist', async () => {
		const { instance } = await defaultRender();

		expect(instance).toBeTruthy();
	});

	it('should include all archive information', async () => {
		const { find, element } = await defaultRender();

		expect(find('.profile-pic img').attributes.src).toBe('thumbUrl');
		expect(element.nativeElement.innerText).toContain(
			'The Unit Testing Archive',
		);
	});

	it('should be able to get proper classnames', async () => {
		const { instance } = await defaultRender();
		function expectClassnameForArchiveType(
			archiveType: ArchiveType,
			expectedClassname: string,
		) {
			instance.archive.type = archiveType;
			instance.ngOnInit();

			expect(instance.classNames).toContain(expectedClassname);
		}

		expectClassnameForArchiveType('type.archive.person', 'personal');
		expectClassnameForArchiveType('type.archive.group', 'group');
		expectClassnameForArchiveType('type.archive.family', 'group');
		expectClassnameForArchiveType('type.archive.organization', 'organization');
		expectClassnameForArchiveType('type.archive.nonprofit', 'organization');
	});

	describe('Accessibility', () => {
		it('has alt text for all img tags', async () => {
			const { find } = await defaultRender();
			const images = find('img');
			images.forEach(() => {
				expect(images.attributes.alt).not.toBeUndefined();
			});
		});

		it('has specific label text for each link', async () => {
			const { find } = await defaultRender();
			const link = find('a');

			expect(link.attributes['aria-label']).toContain('Unit Testing');
		});
	});
});
