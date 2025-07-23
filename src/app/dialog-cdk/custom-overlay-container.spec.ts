/* @format */
import { TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import { CustomOverlayContainer } from './custom-overlay-container';

describe('CustomOverlayContainer', () => {
	let customOverlayContainer: CustomOverlayContainer;
	let document: Document;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: OverlayContainer, useClass: CustomOverlayContainer },
				{ provide: DOCUMENT, useValue: window.document },
			],
		});

		customOverlayContainer = TestBed.inject(
			OverlayContainer,
		) as CustomOverlayContainer;
		document = TestBed.inject(DOCUMENT);
	});

	it('should be created', () => {
		expect(customOverlayContainer).toBeTruthy();
	});

	it('should append the container to pr-app-root if it exists', () => {
		const mockBodyNode = document.createElement('body');
		const mockAppRoot = document.createElement('pr-app-root');
		mockBodyNode.appendChild(mockAppRoot);

		customOverlayContainer.appendContainer(mockBodyNode);

		const container = mockBodyNode.querySelector('.cdk-overlay-container');

		expect(container).toBeTruthy();
		expect(mockAppRoot.contains(container!)).toBeTrue();
	});

	it('should append the container to document.body if pr-app-root does not exist', () => {
		const mockBodyNode = document.createElement('body');
		customOverlayContainer.appendContainer(mockBodyNode);

		const container = mockBodyNode.querySelector('.cdk-overlay-container');

		expect(container).toBeTruthy();
		expect(mockBodyNode.contains(container!)).toBeTrue();
	});
});
