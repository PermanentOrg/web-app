import { FolderVO, RecordVO } from '@models';
import { PublicRoutePipe } from './public-route.pipe';

describe('PublicRoutePipe', () => {
	let pipe: PublicRoutePipe;

	beforeEach(() => {
		pipe = new PublicRoutePipe();
	});

	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('returns correct link for folder with no archiveArchiveNbrs defined', () => {
		const folder = new FolderVO({
			folder_linkId: 100,
			archiveNbr: '0001-00gh',
		});
		const route = pipe.transform(folder);

		expect(route).toBeDefined();
		expect(route).toEqual([
			'/p',
			'archive',
			'0001-0000',
			folder.archiveNbr,
			folder.folder_linkId,
		]);
	});

	it('returns correct link for record with no archiveArchiveNbrs defined', () => {
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
		expect(route).toEqual([
			'/p',
			'archive',
			'0001-0000',
			'0001-meow',
			'1234',
			'record',
			record.archiveNbr,
		]);
	});

	it('returns correct link for record with no ParentFolderVOs defined', () => {
		const record = new RecordVO({
			parentFolder_linkId: 1234,
			parentFolderArchiveNumber: '0001-meow',
			folder_linkId: 1001,
			archiveNbr: '0001-00gp',
		});
		const route = pipe.transform(record);

		expect(route).toBeDefined();
		expect(route).toEqual([
			'/p',
			'archive',
			'0001-0000',
			'0001-meow',
			1234,
			'record',
			record.archiveNbr,
		]);
	});

	it('returns correct link for record in the public root folder', () => {
		const record = new RecordVO({
			ParentFolderVOs: [
				new FolderVO({
					archiveNbr: 'do-not-use',
					folder_linkId: -1,
					folder_linkType: 'type.folder_link.root.public',
					type: 'type.folder.root.public',
				}),
			],
			folder_linkId: 1001,
			archiveNbr: '1234-5678',
		});
		const route = pipe.transform(record);

		expect(route).toEqual([
			'/p',
			'archive',
			'1234-0000',
			'record',
			'1234-5678',
		]);
	});

	it('returns link for record in the public root folder, even if there is no ParentFolderVOs defined', () => {
		const record = new RecordVO({
			ParentFolderVOs: [
				new FolderVO({
					archiveNbr: 'do-not-use',
					folder_linkId: -1,
					folder_linkType: 'type.folder_link.root.public',
					type: 'type.folder.root.public',
				}),
			],
			parentFolderArchiveNumber: '1234-000d',
			parentFolder_linkId: 987,
			folder_linkId: 1001,
			archiveNbr: '1234-5678',
		});
		const route = pipe.transform(record);

		expect(route).toEqual([
			'/p',
			'archive',
			'1234-0000',
			'1234-000d',
			987,
			'record',
			'1234-5678',
		]);
	});

	it('uses the archiveArchiveNbr field to get the archive an item is located in', () => {
		const route = pipe.transform(
			new FolderVO({
				archiveArchiveNbr: '1234-0000',
				archiveNbr: 'abcd-efgh',
				folder_linkId: 1234,
			}),
		);

		expect(route).toEqual(['/p', 'archive', '1234-0000', 'abcd-efgh', 1234]);
	});

	it("uses the parent folder's `archiveArchiveNbr` if the target does not have it defined", () => {
		const route = pipe.transform(
			new FolderVO({
				ParentFolderVOs: [new FolderVO({ archiveArchiveNbr: '1234-0000' })],
				archiveNbr: 'abcd-efgh',
				folder_linkId: 1234,
			}),
		);

		expect(route).toEqual(['/p', 'archive', '1234-0000', 'abcd-efgh', 1234]);
	});
});
