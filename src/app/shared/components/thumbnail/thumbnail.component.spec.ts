import { Shallow } from 'shallow-render';
import { ThumbnailComponent } from '@shared/components/thumbnail/thumbnail.component';
import { FolderVO, ItemVO, RecordVO } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
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

const fullItem2 = new RecordVO(
	{
		folder_linkId: 2,
		thumbURL200: addParam(image200, 'item2'),
		thumbURL500: addParam(image500, 'item2'),
		thumbURL1000: addParam(image500, 'item2'),
	},
	{ dataStatus: DataStatus.Full },
);

@NgModule({})
class DummyModule {}

describe('ThumbnailComponent', () => {
	let shallow: Shallow<ThumbnailComponent>;

	beforeEach(() => {
		TestImage.testError = false;
		window.devicePixelRatio = 1;
		shallow = new Shallow(ThumbnailComponent, DummyModule)
			.declare(GetAltTextPipe)
			.provideMock({
				provide: 'Image',
				useValue: TestImage,
			})
			.import(FontAwesomeModule);
	});

	async function renderWithItem(
		item: ItemVO = minItem,
		size: number = 200,
		maxWidth?: number,
	) {
		return await shallow.render(
			`<div [style.width]="'${size}px'" [style.height]="'${size}px'"><pr-thumbnail [item]="item" [maxWidth]="maxWidth"></pr-thumbnail></div>`,
			{
				bind: {
					item: item.isFolder ? new FolderVO(item) : new RecordVO(item),
					maxWidth,
				},
			},
		);
	}

	it('should exist', async () => {
		const { instance } = await renderWithItem();

		expect(instance).toBeTruthy();
	});

	it('should use image 200 if item is lean at any DPI and width', async () => {
		const { instance } = await renderWithItem(leanItem);

		expect(instance.getCurrentThumbUrl()).toEqual(image200);
	});

	it('should use image 200 for low DPI at width 100', async () => {
		const { instance } = await renderWithItem(fullItem, 100);

		expect(instance.getTargetThumbWidth()).toEqual(200);
		expect(instance.getCurrentThumbUrl()).toEqual(image200);
	});

	it('should use image 200 for high DPI at width 100', async () => {
		window.devicePixelRatio = 2;
		const { instance } = await renderWithItem(fullItem, 100);

		expect(instance.getTargetThumbWidth()).toEqual(200);
		expect(instance.getCurrentThumbUrl()).toEqual(image200);
	});

	it('should use image 200 for low DPI at width 200', async () => {
		const { instance } = await renderWithItem(fullItem, 200);

		expect(instance.getTargetThumbWidth()).toEqual(200);
		expect(instance.getCurrentThumbUrl()).toEqual(image200);
	});

	it('should use image 500 for high DPI at width 200', async () => {
		window.devicePixelRatio = 2;
		const { instance } = await renderWithItem(fullItem, 200);

		expect(instance.getTargetThumbWidth()).toEqual(500);
		expect(instance.getCurrentThumbUrl()).toEqual(image500);
	});

	it('should use the maximum image size if there is no bigger thumbnail', async () => {
		window.devicePixelRatio = 10000;
		const { instance } = await renderWithItem(fullItem, 10000);

		expect(instance.getTargetThumbWidth()).toEqual(2000);
		expect(instance.getCurrentThumbUrl()).toEqual(image2000);
	});

	it('should use reset when changing records', async () => {
		window.devicePixelRatio = 2;
		const { instance, fixture } = await renderWithItem(fullItem, 200);

		expect(instance.getTargetThumbWidth()).toEqual(500);
		expect(instance.getCurrentThumbUrl()).toEqual(image500);

		instance.item = fullItem2;
		fixture.detectChanges();

		expect(instance.getTargetThumbWidth()).toEqual(500);
		expect(instance.getCurrentThumbUrl()).toEqual(fullItem2.thumbURL500);
	});

	it('should show a zip icon if the item is a .zip archive', async () => {
		const { find } = await renderWithItem(
			new RecordVO({ ...fullItem, type: 'type.record.archive' }),
			200,
		);

		expect(find('fa-icon').length).toBeGreaterThan(0);
		expect(find('.pr-thumbnail-image:not([hidden])').length).toBe(0);
	});

	it('should show a folder icon if the item is a folder', async () => {
		const { find } = await renderWithItem(
			new FolderVO({
				thumbURL200: 'https://do-not-use',
			}),
		);

		expect(find('.pr-thumbnail-image[hidden]').length).toBe(1);
		expect(find('i.ion-md-folder[hidden]').length).toBe(0);
	});

	it('can have a maximum width set', async () => {
		window.devicePixelRatio = 2;
		const { instance } = await renderWithItem(fullItem, 10000, 200);

		expect(instance.getTargetThumbWidth()).toEqual(200);
		expect(instance.getCurrentThumbUrl()).toEqual(image200);
	});

	it('should show set the background image after it loads', async () => {
		const { find, fixture } = await renderWithItem(fullItem);

		await fixture.whenStable();
		fixture.detectChanges();

		expect(
			find('.pr-thumbnail-image').nativeElement.style.backgroundImage,
		).toContain(image200);
	});

	it('should be able to handle an image erroring out', async () => {
		TestImage.testError = true;
		const { instance, find, fixture } = await renderWithItem(leanItem);

		instance.item.update(fullItem);
		await fixture.whenStable();
		fixture.detectChanges();

		expect(
			find('.pr-thumbnail-image').nativeElement.style.backgroundImage,
		).toBe('');
	});
});
