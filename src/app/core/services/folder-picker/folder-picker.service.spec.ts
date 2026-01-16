import { TestBed } from '@angular/core/testing';
import {
	FolderPickerComponent,
	FolderPickerOperations,
} from '@core/components/folder-picker/folder-picker.component';
import { FolderVO } from '@models/index';
import { FolderPickerService } from './folder-picker.service';

class FakeComponent {
	public currentFolder: FolderVO;
	public chooseFolderPromise: Promise<FolderVO>;
	public chooseFolderResolve: (value: FolderVO) => void;
	public operation: FolderPickerOperations;
	public operationName: string;
	public savePromise: Promise<any>;
	public visible: boolean;
	public waiting: boolean;
	public saving: boolean;
	public isRootFolder = true;
	public allowRecords = false;
	public selectedRecord = null;
	public filterFolderLinkIds: number[];

	public async show(
		startingFolder: FolderVO,
		operation: FolderPickerOperations,
		savePromise?: Promise<any>,
		filterFolderLinkIds: number[] = null,
		allowRecords = false,
	) {
		return {
			startingFolder,
			operation,
			savePromise,
			filterFolderLinkIds,
			allowRecords,
		} as unknown as FolderVO;
	}
}

describe('FolderPickerService', () => {
	let service: FolderPickerService;
	let component: FakeComponent;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [FolderPickerService],
		});
		service = TestBed.inject(FolderPickerService);
		component = new FakeComponent();
		service.registerComponent(component as FolderPickerComponent);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('should throw an error when choosing a folder if the component is not registered', async () => {
		service.unregisterComponent();

		await expectAsync(
			service.chooseFolder(new FolderVO({}), FolderPickerOperations.Move),
		).toBeRejected();
	});

	it('should throw an error when choosing a record if the component is not registered', async () => {
		service.unregisterComponent();

		await expectAsync(service.chooseRecord(new FolderVO({}))).toBeRejected();
	});

	it('cannot register a FolderPickerComponent twice', () => {
		expect(() =>
			service.registerComponent(component as FolderPickerComponent),
		).toThrow();
	});

	it('can unregister a FolderPickerComponent', () => {
		service.unregisterComponent();

		expect(() =>
			service.registerComponent(component as FolderPickerComponent),
		).not.toThrow();
	});

	it('should call the correct component method when choosing a folder', async () => {
		const params = {
			startingFolder: new FolderVO({ folderId: 1 }),
			operation: FolderPickerOperations.Copy,
			savePromise: undefined,
			filterFolderLinkIds: null,
			allowRecords: false,
		};
		const result = await service.chooseFolder(
			params.startingFolder,
			params.operation,
		);

		expect(result).toEqual(params as unknown as FolderVO);
	});

	it('should call the correct component method when choosing a record', async () => {
		const params = {
			startingFolder: new FolderVO({ folderId: 1 }),
			operation: FolderPickerOperations.ChooseRecord,
			savePromise: null,
			filterFolderLinkIds: null,
			allowRecords: true,
		};
		const result = (await service.chooseRecord(params.startingFolder)) as any;

		expect(result).toEqual(params);
	});
});
