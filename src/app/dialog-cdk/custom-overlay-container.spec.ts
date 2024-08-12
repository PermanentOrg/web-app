/* @format */
import { TestBed } from '@angular/core/testing';
import { CustomOverlayContainer } from './custom-overlay-container';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';

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

  describe('_createContainer', () => {
    it('should append the container to pr-app-root if it exists', () => {
      const mockAppRoot = document.createElement('pr-app-root');
      document.body.appendChild(mockAppRoot);

      customOverlayContainer['_createContainer']();

      const container = document.querySelector('.cdk-overlay-container');
      expect(container).toBeTruthy();
      expect(mockAppRoot.contains(container!)).toBeTrue();

      mockAppRoot.remove();
      container?.remove();
    });

    it('should append the container to document.body if pr-app-root does not exist', () => {
      customOverlayContainer['_createContainer']();

      const container = document.querySelector('.cdk-overlay-container');
      expect(container).toBeTruthy();
      expect(document.body.contains(container!)).toBeTrue();

      container?.remove();
    });
  });
});
