import {
	ComponentFixture,
	TestBed,
	fakeAsync,
	flushMicrotasks,
	tick,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { FolderVO, RecordVO } from '@models';
import { DataStatus } from '@models/data-status.enum';
import { DataService } from '@shared/services/data/data.service';
import {
	SlideshowViewComponent,
	SLIDESHOW_INTERVAL_MS,
} from './slideshow-view.component';

function makeImage(url?: string, dataStatus = DataStatus.Full) {
	return new RecordVO(
		{
			type: 'type.record.image',
			FileVOs: url ? [{ fileURL: url }] : [],
		} as any,
		{ dataStatus },
	);
}

describe('SlideshowViewComponent', () => {
	let fixture: ComponentFixture<SlideshowViewComponent>;
	let component: SlideshowViewComponent;
	let router: jasmine.SpyObj<Router>;
	let dataService: jasmine.SpyObj<DataService>;
	let params: Record<string, string>;
	let routerUrl: string;

	function setup(children: any[]) {
		router = jasmine.createSpyObj('Router', ['navigate']);
		Object.defineProperty(router, 'url', { get: () => routerUrl });
		dataService = jasmine.createSpyObj('DataService', ['fetchFullItems']);
		dataService.fetchFullItems.and.callFake(async (items) => {
			items.forEach((item) => (item.dataStatus = DataStatus.Full));
		});

		TestBed.configureTestingModule({
			declarations: [SlideshowViewComponent],
			imports: [NgbCarouselModule],
			providers: [
				{
					provide: ActivatedRoute,
					useValue: {
						snapshot: {
							data: {
								currentFolder: new FolderVO({ ChildItemVOs: children }),
							},
							params,
						},
					},
				},
				{ provide: Router, useValue: router },
				{ provide: DataService, useValue: dataService },
			],
			schemas: [NO_ERRORS_SCHEMA],
		});

		fixture = TestBed.createComponent(SlideshowViewComponent);
		component = fixture.componentInstance;
	}

	function render() {
		fixture.detectChanges();
		flushMicrotasks();
		fixture.detectChanges();
	}

	function activeImage(): HTMLImageElement | null {
		return fixture.nativeElement.querySelector('.carousel-item.active img');
	}

	function loadActiveImage() {
		activeImage().dispatchEvent(new Event('load'));
		fixture.detectChanges();
	}

	function pressKey(key: string) {
		document.dispatchEvent(new KeyboardEvent('keydown', { key }));
		render();
	}

	beforeEach(() => {
		params = { archiveNbr: '0001-0001', folderLinkId: '42' };
		routerUrl = '/app/private/view/slideshow/0001-0001/42';
	});

	it('shows only images and skips other file types', fakeAsync(() => {
		const image = makeImage('one.jpg');
		setup([
			new RecordVO({ type: 'type.record.video' }),
			image,
			new FolderVO({ type: 'type.folder.private' }),
		]);
		render();

		expect(component.images).toEqual([image]);
		expect(activeImage().getAttribute('src')).toBe('one.jpg');
	}));

	it('advances after the interval and loops back to the start', fakeAsync(() => {
		setup([makeImage('one.jpg'), makeImage('two.jpg')]);
		render();

		expect(activeImage().getAttribute('src')).toBe('one.jpg');

		loadActiveImage();
		tick(SLIDESHOW_INTERVAL_MS - 1);
		render();

		expect(activeImage().getAttribute('src')).toBe('one.jpg');

		tick(1);
		render();

		expect(activeImage().getAttribute('src')).toBe('two.jpg');

		loadActiveImage();
		tick(SLIDESHOW_INTERVAL_MS);
		render();

		expect(activeImage().getAttribute('src')).toBe('one.jpg');

		fixture.destroy();
	}));

	it('waits for the image to load before starting the timer', fakeAsync(() => {
		setup([makeImage('one.jpg'), makeImage('two.jpg')]);
		render();

		tick(SLIDESHOW_INTERVAL_MS * 3);
		render();

		expect(activeImage().getAttribute('src')).toBe('one.jpg');
	}));

	it('moves forward and back with the arrow keys', fakeAsync(() => {
		setup([makeImage('one.jpg'), makeImage('two.jpg'), makeImage('three.jpg')]);
		render();

		pressKey('ArrowRight');

		expect(activeImage().getAttribute('src')).toBe('two.jpg');

		pressKey('ArrowLeft');
		pressKey('ArrowLeft');

		expect(activeImage().getAttribute('src')).toBe('three.jpg');
	}));

	it('moves with the on-screen arrows', fakeAsync(() => {
		setup([makeImage('one.jpg'), makeImage('two.jpg')]);
		render();

		fixture.nativeElement.querySelector('.carousel-control-next').click();
		render();

		expect(activeImage().getAttribute('src')).toBe('two.jpg');

		fixture.nativeElement.querySelector('.carousel-control-prev').click();
		render();

		expect(activeImage().getAttribute('src')).toBe('one.jpg');
	}));

	it('restarts the countdown after moving manually', fakeAsync(() => {
		setup([makeImage('one.jpg'), makeImage('two.jpg'), makeImage('three.jpg')]);
		render();
		loadActiveImage();
		tick(SLIDESHOW_INTERVAL_MS - 1000);

		pressKey('ArrowRight');
		loadActiveImage();
		tick(1000);
		render();

		expect(activeImage().getAttribute('src')).toBe('two.jpg');

		tick(SLIDESHOW_INTERVAL_MS - 1000);
		render();

		expect(activeImage().getAttribute('src')).toBe('three.jpg');

		fixture.destroy();
	}));

	it('only loads images next to the current slide', fakeAsync(() => {
		setup([
			makeImage('one.jpg'),
			makeImage('two.jpg'),
			makeImage('three.jpg'),
			makeImage('four.jpg'),
			makeImage('five.jpg'),
		]);
		render();

		const sources = Array.from(
			fixture.nativeElement.querySelectorAll('.carousel-item img'),
		).map((img: HTMLImageElement) => img.getAttribute('src'));

		expect(sources).toEqual(['one.jpg', 'two.jpg', 'five.jpg']);
	}));

	it('fetches full data for images that are not loaded yet', fakeAsync(() => {
		const lean = makeImage('one.jpg', DataStatus.Lean);
		setup([lean]);
		render();

		expect(dataService.fetchFullItems).toHaveBeenCalled();
		expect(dataService.fetchFullItems.calls.first().args[0]).toContain(lean);
		expect(activeImage().getAttribute('src')).toBe('one.jpg');
	}));

	it('skips images with no viewable file', fakeAsync(() => {
		setup([makeImage(), makeImage('two.jpg')]);
		render();
		render();

		expect(component.currentIndex).toBe(1);
		expect(activeImage().getAttribute('src')).toBe('two.jpg');
	}));

	it('skips backwards when moving backwards', fakeAsync(() => {
		setup([makeImage('one.jpg'), makeImage(), makeImage('three.jpg')]);
		render();

		pressKey('ArrowLeft');

		expect(activeImage().getAttribute('src')).toBe('three.jpg');

		pressKey('ArrowLeft');
		render();

		expect(activeImage().getAttribute('src')).toBe('one.jpg');
	}));

	it('shows an empty state when the folder has no images', fakeAsync(() => {
		setup([new RecordVO({ type: 'type.record.document' })]);
		render();

		expect(component.images.length).toBe(0);
		expect(
			fixture.nativeElement.querySelector('.slideshow-empty'),
		).toBeTruthy();
	}));

	it('shows an empty state when no images can be viewed', fakeAsync(() => {
		setup([makeImage(), makeImage()]);
		render();
		render();
		render();

		expect(
			fixture.nativeElement.querySelector('.slideshow-empty'),
		).toBeTruthy();
	}));

	it('stops cycling when destroyed', fakeAsync(() => {
		setup([makeImage('one.jpg'), makeImage('two.jpg')]);
		render();
		loadActiveImage();

		fixture.destroy();
		tick(SLIDESHOW_INTERVAL_MS);
		flushMicrotasks();

		expect(component.currentIndex).toBe(0);
	}));

	it('exits back to the folder on Escape', fakeAsync(() => {
		setup([makeImage('one.jpg')]);
		render();

		pressKey('Escape');

		expect(router.navigate).toHaveBeenCalledWith([
			'/app/private',
			'0001-0001',
			'42',
		]);
	}));

	it('exits to the public root when started from public files', fakeAsync(() => {
		params = {};
		routerUrl = '/app/public/view/slideshow';
		setup([makeImage('one.jpg')]);
		render();

		component.exit();

		expect(router.navigate).toHaveBeenCalledWith(['/app/public']);
	}));
});
