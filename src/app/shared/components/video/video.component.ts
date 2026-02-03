import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';
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

	private videoWrapperElem: Element;
	private videoElem: Element;
	public videoSrc: string;
	public isProcessing: boolean;

	constructor(
		private elementRef: ElementRef,
		private renderer: Renderer2,
	) {}

	ngOnInit() {
		this.videoElem = this.elementRef.nativeElement.querySelector('video');
		this.videoWrapperElem =
			this.elementRef.nativeElement.querySelector('.pr-video-wrapper');

		this.videoElem.addEventListener('loadstart', (event) => {
			setTimeout(() => {
				this.renderer.removeClass(this.videoWrapperElem, 'loading');
				gsap.from(this.videoElem, {
					duration: FADE_IN_DURATION,
					opacity: 0,
					ease: 'Power4.easeOut',
				});
			}, 250);
		});

		const accessFile = GetAccessFile(this.item);

		if (accessFile) {
			this.videoSrc = accessFile.fileURL;
			this.isProcessing = false;
		} else {
			this.renderer.removeClass(this.videoWrapperElem, 'loading');
			this.isProcessing = true;
		}
	}
}
