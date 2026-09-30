import { TestBed } from '@angular/core/testing';
import { DocumentTypeService } from './document-type.service';

describe('DocumentTypeService', () => {
	let service: DocumentTypeService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(DocumentTypeService);
	});

	it('should return an empty string for a record with no document type', () => {
		expect(service.get(1)).toBe('');
	});

	it('should return the document type saved for a record', () => {
		service.set(1, 'Birth certificate');

		expect(service.get(1)).toBe('Birth certificate');
	});

	it('should keep document types separate per record', () => {
		service.set(1, 'Letter');
		service.set(2, 'Diploma');

		expect(service.get(1)).toBe('Letter');
		expect(service.get(2)).toBe('Diploma');
	});

	it('should clear the document type when saved as empty', () => {
		service.set(1, 'Letter');
		service.set(1, '');

		expect(service.get(1)).toBe('');
	});
});
