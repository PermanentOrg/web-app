import {
	Directive,
	Input,
	OnInit,
	OnChanges,
	ElementRef,
	SimpleChanges,
	Renderer2,
} from '@angular/core';
import { gsap } from 'gsap';

const FADE_IN_DURATION = 0.3;

@Directive({
	selector: '[prBgImage]',
	standalone: false,
})
export class BgImageSrcDirective implements OnInit, OnChanges {
	@Input() bgSrc: string;
	@Input() cover: boolean;

	private element: Element;
	private fadeIn = false;

	constructor(
		element: ElementRef,
		private renderer: Renderer2,
	) {
		this.element = element.nativeElement;
	}

	ngOnInit() {
		this.setBgImage();
		if (!this.bgSrc) {
			this.fadeIn = true;
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		this.setBgImage(changes);
	}

	loadBgImage() {
		const bgImage = new Image();
		bgImage.onload = () => {
			this.renderer.setStyle(
				this.element,
				'background-image',
				`url(${this.bgSrc})`,
			);
			this.renderer.addClass(this.element, 'bg-image-loaded');
			if (this.fadeIn) {
				this.fadeIn = false;
				gsap.from(this.element, FADE_IN_DURATION, {
					opacity: 0,
					ease: 'Power4.easeOut',
				});
			}
		};
		bgImage.src = this.bgSrc;
	}

	setBgImage(changes?: SimpleChanges) {
		if (this.bgSrc) {
			this.loadBgImage();
		} else {
			this.renderer.setStyle(this.element, 'background-image', '');
			this.renderer.removeClass(this.element, 'bg-image-loaded');
		}

		this.cover
			? this.renderer.addClass(this.element, 'bg-image-cover')
			: this.renderer.removeClass(this.element, 'bg-image-cover');
	}
}
