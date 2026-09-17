import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { gsap } from 'gsap';

import { RecordVO } from '@root/app/models';
import { GetAccessFile } from '@models/get-access-file';

const FADE_IN_DURATION = 0.3;

@Component({
	selector: 'pr-video',
	templateUrl: './video.component.html',
	styleUrls: ['./video.component.scss'],
	standalone: false,
})
export class VideoComponent implements OnInit {
	@Input() item: RecordVO;

	private videoElem: Element;
	private hasVideoStartedLoading = false;

	constructor(private elementRef: ElementRef) {}

	/**
	 * The record is updated in place once its files arrive, so its object
	 * reference never changes and ngOnChanges never fires. Reading the file off
	 * the record on every change detection run is what lets the player replace
	 * the placeholder when the files show up after the first render.
	 */
	public get videoSrc(): string | undefined {
		return GetAccessFile(this.item)?.fileURL;
	}

	public get isProcessing(): boolean {
		return !this.videoSrc;
	}

	public get isLoading(): boolean {
		return !this.isProcessing && !this.hasVideoStartedLoading;
	}

	ngOnInit() {
		this.videoElem = this.elementRef.nativeElement.querySelector('video');

		this.videoElem.addEventListener('loadstart', () => {
			setTimeout(() => {
				this.hasVideoStartedLoading = true;
				gsap.from(this.videoElem, {
					duration: FADE_IN_DURATION,
					opacity: 0,
					ease: 'Power4.easeOut',
				});
			}, 250);
		});
	}
}
