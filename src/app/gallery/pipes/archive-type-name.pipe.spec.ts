import { ArchiveType } from '@models/archive-vo';
import { ArchiveTypeNamePipe } from './archive-type-name.pipe';

describe('ArchiveTypeNamePipe', () => {
	it('can create an instance', () => {
		const pipe = new ArchiveTypeNamePipe();

		expect(pipe).toBeTruthy();
	});

	it('transforms archive types to their proper names', () => {
		const pipe = new ArchiveTypeNamePipe();

		function expectNameForType(type: ArchiveType, expectedName: string) {
			expect(pipe.transform(type)).toBe(expectedName);
		}

		expectNameForType('type.archive.person', 'Personal Archive');
		expectNameForType('type.archive.group', 'Group Archive');
		expectNameForType('type.archive.family', 'Group Archive');
		expectNameForType('type.archive.organization', 'Organizational Archive');
		expectNameForType('type.archive.nonprofit', 'Organizational Archive');
	});
});
