import { FolderVO, RecordVO } from '@models';
import { PublicLinkPipe } from './public-link.pipe';
import { PublicRoutePipe } from './public-route.pipe';

describe('PublicLinkPipe', () => {
	let pipe: PublicLinkPipe;

	beforeEach(() => {
		pipe = new PublicLinkPipe(new PublicRoutePipe());
	});

	it('can create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('returns correct link for folder', () => {
		const folder = new FolderVO({
			folder_linkId: 100,
			archiveNbr: '0001-00gh',
		});
		const route = pipe.transform(folder);

		expect(route).toBeDefined();
		expect(route.endsWith('/p/archive/0001-0000/0001-00gh/100')).toBeTruthy();
	});

	it('returns correct link for record', () => {
		const record = new RecordVO({
			ParentFolderVOs: [
				new RecordVO({
					folder_linkId: 1234,
					archiveNbr: '0001-meow',
				}),
			],
			folder_linkId: 1001,
			archiveNbr: '0001-00gp',
		});
		const route = pipe.transform(record);

		expect(route).toBeDefined();
		expect(
			route.endsWith('/p/archive/0001-0000/0001-meow/1234/record/0001-00gp'),
		).toBeTruthy();
	});

	it('adds only one slash in the url before p/archive', () => {
		const folder = new FolderVO({
			folder_linkId: 100,
			archiveNbr: '0001-00gh',
		});

		const url = new URL(pipe.transform(folder));

		expect(url.pathname).not.toContain('//');
	});
});
