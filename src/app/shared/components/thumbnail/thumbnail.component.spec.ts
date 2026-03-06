import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	tick,
} from '@angular/core/testing';
import { ThumbnailComponent } from '@shared/components/thumbnail/thumbnail.component';
import { FolderVO, ItemVO, RecordVO } from '@models';
import { DataStatus } from '@models/data-status.enum';
import {
	FontAwesomeModule,
	FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import { faFileArchive } from '@fortawesome/free-solid-svg-icons';
import { GetAltTextPipe } from '../../pipes/get-alt-text.pipe';

class TestImage {
	public static testError: boolean = false;
	public onload = () => {};
	public onerror = () => {};
	private source: string;

	get src(): string {
		return this.source;
	}

	set src(src: string) {
		this.source = src;
		if (TestImage.testError) {
			setTimeout(() => {
				this.onerror();
			});
		} else {
			setTimeout(() => {
				this.onload();
			});
		}
	}
}

// For headless test runs, this URL doesn't matter since loading shouldn't
// actually occur, but this URL provides free placeholder graphics for the
// HTML Karma test runner.
const baseImageUrl = 'https://placehold.co';

const image200 = `${baseImageUrl}/200`;
const image256 = `${baseImageUrl}/256`;
const image500 = `${baseImageUrl}/500`;
const image1000 = `${baseImageUrl}/1000`;
const image2000 = `${baseImageUrl}/2000`;

function addParam(url, param) {
	return `${url}?text=${param}`;
}

const minItem = new RecordVO(
	{ folder_linkId: 1 },
	{ dataStatus: DataStatus.Placeholder },
);
const leanItem = new RecordVO(
	{ folder_linkId: 1, thumbURL200: image200 },
	{ dataStatus: DataStatus.Lean },
);
const fullItem = new RecordVO(
	{
		folder_linkId: 1,
		thumbURL200: image200,
		thumbURL500: image500,
		thumbURL1000: image1000,
		thumbURL2000: image2000,
		type: 'type.record.image',
	},
	{ dataStatus: DataStatus.Full },
);

const fullItemWith256 = new RecordVO(
	{
		folder_linkId: 3,
		thumbURL200: image200,
		thumbnail256: image256,
		thumbURL500: image500,
		thumbURL1000: image1000,
		thumbURL2000: image2000,
		type: 'type.record.image',
	},
	{ dataStatus: DataStatus.Full },
);

const fullItem2 = new RecordVO(
	{
		folder_linkId: 2,
		thumbURL200: addParam(image200, 'item2'),
		thumbURL500: addParam(image500, 'item2'),
		thumbURL1000: addParam(image500, 'item2'),
	},
	{ dataStatus: DataStatus.Full },
);

@Component({
	selector: 'pr-thumbnail-test-host',
	template: `<div [style.width]="width" [style.height]="height">
		<pr-thumbnail [item]="item"></pr-thumbnail>
	</div>`,
	standalone: false,
})
class ThumbnailTestHostComponent {
	item: ItemVO = minItem;
	width: string = '200px';
	height: string = '200px';
}

describe('ThumbnailComponent', () => {
	let fixture: ComponentFixture<ThumbnailTestHostComponent>;
	let hostComponent: ThumbnailTestHostComponent;
	let thumbnailComponent: ThumbnailComponent;

	beforeEach(async () => {
		TestImage.testError = false;

		await TestBed.configureTestingModule({
			imports: [FontAwesomeModule],
			declarations: [
				ThumbnailComponent,
				ThumbnailTestHostComponent,
				GetAltTextPipe,
			],
			providers: [{ provide: 'Image', useValue: TestImage }],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		const library = TestBed.inject(FaIconLibrary);
		library.addIcons(faFileArchive);

		fixture = TestBed.createComponent(ThumbnailTestHostComponent);
		hostComponent = fixture.componentInstance;
		fixture.detectChanges();
		thumbnailComponent =
			fixture.debugElement.children[0].children[0].componentInstance;
	});

	function setItem(item: ItemVO) {
		hostComponent.item = item.isFolder
			? new FolderVO(item)
			: new RecordVO(item);

		fixture.detectChanges();

		// Force recalculation
		thumbnailComponent.resetImage();

		// Update the view with the new state (isZip, etc.)
		fixture.detectChanges();
	}

	it('should exist', async () => {
		expect(thumbnailComponent).toBeTruthy();
	});

	it('should use image 200 if item is lean (only has thumbURL200)', async () => {
		setItem(leanItem);

		expect(thumbnailComponent.getCurrentThumbUrl()).toEqual(image200);
	});

	it('should use image 500 for fullItem (no thumbnail256, prefers 500 over 200)', async () => {
		setItem(fullItem);

		expect(thumbnailComponent.getCurrentThumbUrl()).toEqual(image500);
	});

	it('should prefer thumbnail256 when available', async () => {
		setItem(fullItemWith256);

		expect(thumbnailComponent.getTargetThumbWidth()).toEqual(256);
		expect(thumbnailComponent.getCurrentThumbUrl()).toEqual(image256);
	});

	it('should use reset when changing records', async () => {
		setItem(fullItem);

		expect(thumbnailComponent.getCurrentThumbUrl()).toEqual(image500);

		thumbnailComponent.item = fullItem2;
		fixture.detectChanges();

		expect(thumbnailComponent.getCurrentThumbUrl()).toEqual(
			fullItem2.thumbURL500,
		);
	});

	it('should show a zip icon if the item is a .zip archive', async () => {
		setItem(new RecordVO({ ...fullItem, type: 'type.record.archive' }));

		const faIcons = fixture.nativeElement.querySelectorAll('fa-icon');
		const visibleImages = fixture.nativeElement.querySelectorAll(
			'.pr-thumbnail-image:not([hidden])',
		);

		expect(faIcons.length).toBeGreaterThan(0);
		expect(visibleImages.length).toBe(0);
	});

	it('should show a folder icon if the item is a folder', async () => {
		setItem(
			new FolderVO({
				thumbURL200: 'https://do-not-use',
			}),
		);

		const hiddenImages = fixture.nativeElement.querySelectorAll(
			'.pr-thumbnail-image[hidden]',
		);
		const folderIcons = fixture.nativeElement.querySelectorAll(
			'.pr-thumbnail-icon:not([hidden]) i.material-icons',
		);

		expect(hiddenImages.length).toBe(1);
		expect(folderIcons.length).toBeGreaterThan(0);
	});

	it('should show set the background image after it loads', fakeAsync(() => {
		setItem(fullItem);

		// Wait for the TestImage setTimeout to fire
		tick(100);
		fixture.detectChanges();

		const thumbnailImage = fixture.nativeElement.querySelector(
			'.pr-thumbnail-image',
		);

		expect(thumbnailImage.style.backgroundImage).toContain(image500);
	}));

	it('should be able to handle an image erroring out', async () => {
		TestImage.testError = true;
		setItem(leanItem);

		thumbnailComponent.item.update(fullItem);
		await fixture.whenStable();
		fixture.detectChanges();

		const thumbnailImage = fixture.nativeElement.querySelector(
			'.pr-thumbnail-image',
		);

		expect(thumbnailImage.style.backgroundImage).toBe('');
	});
});
