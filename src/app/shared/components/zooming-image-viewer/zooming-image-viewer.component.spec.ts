import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import OpenSeadragon from 'openseadragon';
import { GetAltTextPipe } from '@shared/pipes/get-alt-text.pipe';
import { RecordVO } from '@models/index';
import { ZoomingImageViewerComponent } from './zooming-image-viewer.component';

class MockOpenSeaDragon {
	private handlers = new Map<string, (any) => void>();

	constructor(public options: OpenSeadragon.Options) {}

	public addHandler(eventName: string, handler: (any) => void) {
		this.handlers.set(eventName, handler);
	}

	public raiseEvent(eventName: string, event: any) {
		this.handlers.get(eventName)(event);
	}

	public destroy(): void {
		// do nothing
	}
}

function createMockOpenSeaDragon(options: OpenSeadragon.Options) {
	return new MockOpenSeaDragon(options);
}

describe('ZoomingImageViewerComponent', () => {
	let fixture: ComponentFixture<ZoomingImageViewerComponent>;
	let instance: ZoomingImageViewerComponent;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ZoomingImageViewerComponent, GetAltTextPipe],
			providers: [
				{ provide: 'openseadragon', useValue: createMockOpenSeaDragon },
			],
			schemas: [CUSTOM_ELEMENTS_SCHEMA],
		}).compileComponents();

		fixture = TestBed.createComponent(ZoomingImageViewerComponent);
		instance = fixture.componentInstance;
	});

	function renderWithRecord(record: RecordVO) {
		instance.item = record;
		fixture.detectChanges();
	}

	function getValidTestRecord(): RecordVO {
		return new RecordVO({
			FileVOs: [{ fileURL: 'https://invalid-url' }],
			type: 'type.record.image',
		});
	}

	it('should create', async () => {
		renderWithRecord(getValidTestRecord());

		expect(instance).toBeTruthy();
	});

	describe('Choose full size image', async () => {
		it('will return undefined if no FileVOs are defined', () => {
			expect(
				ZoomingImageViewerComponent.chooseFullSizeImage(
					new RecordVO({ FileVOs: [] }),
				),
			).toBeUndefined();
		});

		it('will return the only FileVO url if it exists', () => {
			expect(
				ZoomingImageViewerComponent.chooseFullSizeImage(
					new RecordVO({ FileVOs: [{ fileURL: 'test' }] }),
				),
			).toBe('test');
		});

		it('will return the converted FileVO url', () => {
			expect(
				ZoomingImageViewerComponent.chooseFullSizeImage(
					new RecordVO({
						FileVOs: [
							{ fileURL: 'invalid' },
							{ format: 'file.format.converted', fileURL: 'test' },
						],
					}),
				),
			).toBe('test');
		});

		it('will return the first FileVO if there is no converted file', () => {
			expect(
				ZoomingImageViewerComponent.chooseFullSizeImage(
					new RecordVO({
						FileVOs: [{ fileURL: 'test' }, { fileURL: 'invalid' }],
					}),
				),
			).toBe('test');
		});
	});

	describe('Record formats that prevent openseadragon setup', () => {
		function expectNoViewerWithRecord(record: RecordVO) {
			renderWithRecord(record);

			expect(instance.viewer).toBeUndefined();
		}

		it('needs an instance of RecordVO', async () => {
			expectNoViewerWithRecord({} as RecordVO);
		});

		it('needs FileVOs', async () => {
			expectNoViewerWithRecord(new RecordVO({ type: 'type.record.image' }));
		});

		it('needs to be an image', async () => {
			expectNoViewerWithRecord(
				new RecordVO({ FileVOs: [{ fileURL: 'test' }] }),
			);
		});

		it('needs a valid image url', async () => {
			expectNoViewerWithRecord(
				new RecordVO({
					FileVOs: [{}],
					type: 'type.record.image',
				}),
			);
		});
	});

	it('sets up openseadragon with a record that is an image', async () => {
		renderWithRecord(getValidTestRecord());

		expect(instance.viewer).toBeTruthy();
	});

	it('should output an event when going fullscreen', async () => {
		renderWithRecord(getValidTestRecord());
		const isFullScreenSpy = spyOn(instance.isFullScreen, 'emit');

		const viewer = instance.viewer;

		viewer.raiseEvent('full-screen', { fullScreen: true });

		expect(isFullScreenSpy).toHaveBeenCalledWith(true);

		viewer.raiseEvent('full-screen', { fullScreen: false });

		expect(isFullScreenSpy).toHaveBeenCalledWith(false);
	});

	it('should output an event if the user zooms in', async () => {
		renderWithRecord(getValidTestRecord());
		const disableSwipeSpy = spyOn(instance.disableSwipe, 'emit');

		const viewer = instance.viewer;
		viewer.raiseEvent('zoom', { zoom: 2 });
		viewer.raiseEvent('zoom', { zoom: 3 });

		expect(disableSwipeSpy).toHaveBeenCalledWith(true);

		viewer.raiseEvent('zoom', { zoom: 2 });

		expect(disableSwipeSpy).toHaveBeenCalledWith(false);
	});

	it('should disable panning if the zoom level is lesss than 1', async () => {
		renderWithRecord(getValidTestRecord());
		const viewer = instance.viewer;

		const expectPanning = (enabled: boolean) => {
			expect((viewer as OpenSeadragon.Options).panHorizontal).toBe(enabled);

			expect((viewer as OpenSeadragon.Options).panVertical).toBe(enabled);
		};

		viewer.raiseEvent('zoom', { zoom: 1 });
		viewer.raiseEvent('zoom', { zoom: 0.5 });

		expectPanning(false);

		viewer.raiseEvent('zoom', { zoom: 1.1 });
		expectPanning(true);
	});
});
