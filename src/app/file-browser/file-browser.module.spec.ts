import { FileBrowserModule } from './file-browser.module';

describe('FileBrowserModule', () => {
	let fileBrowserModule: FileBrowserModule;

	beforeEach(() => {
		fileBrowserModule = new FileBrowserModule();
	});

	it('should create an instance', () => {
		expect(fileBrowserModule).toBeTruthy();
	});
});
