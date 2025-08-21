import { GetFileTypePipe } from './get-file-type.pipe';

describe('GetAltTextPipe', () => {
	let pipe: GetFileTypePipe;

	beforeEach(() => {
		pipe = new GetFileTypePipe();
	});

	it('create an instance', () => {
		expect(pipe).toBeTruthy();
	});

	it('returns the correct value for a private folder', () => {
		const value = 'type.folder.private';
		const result = pipe.transform(value);

		expect(result).toEqual('Folder');
	});

	it('returns the correct value for an image', () => {
		const value = 'type.record.image';

		const result = pipe.transform(value);

		expect(result).toEqual('Image');
	});

	it('returns the correct value for a video', () => {
		const value = 'type.record.video';
		const result = pipe.transform(value);

		expect(result).toEqual('Video');
	});

	it('returns unknown for no value', () => {
		const value = '';
		const result = pipe.transform(value);

		expect(result).toEqual('Unknown');
	});
});
