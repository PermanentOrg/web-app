import { Component, OnInit, DoCheck, Input, ElementRef } from '@angular/core';
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
export class VideoComponent implements OnInit, DoCheck {
	@Input() item: RecordVO;

	private videoElem: Element;
	public videoSrc: string;
	public isProcessing: boolean;
	public isLoading = true;

	constructor(private elementRef: ElementRef) {}

	ngOnInit() {
		this.videoElem = this.elementRef.nativeElement.querySelector('video');

		this.videoElem.addEventListener('loadstart', () => {
			setTimeout(() => {
				this.isLoading = false;
				gsap.from(this.videoElem, {
					duration: FADE_IN_DURATION,
					opacity: 0,
					ease: 'Power4.easeOut',
				});
			}, 250);
		});

		this.applyAccessFile();
	}

	ngDoCheck() {
		this.applyAccessFile();
	}

	private applyAccessFile(): void {
		const accessFileUrl = GetAccessFile(this.item)?.fileURL ?? null;
		const hasAccessFileChanged = accessFileUrl !== this.videoSrc;

		this.videoSrc = accessFileUrl;
		this.isProcessing = accessFileUrl === null;

		if (hasAccessFileChanged) {
			this.isLoading = accessFileUrl !== null;
		}
	}
}
