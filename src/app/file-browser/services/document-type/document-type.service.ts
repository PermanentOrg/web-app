import { Injectable } from '@angular/core';

// The API has no document type field yet (PER-10805), so values live only in
// memory until the page is refreshed. Swap this for an API call once the
// backend supports it.
@Injectable({
	providedIn: 'root',
})
export class DocumentTypeService {
	private documentTypes = new Map<number, string>();

	get(recordId: number): string {
		return this.documentTypes.get(recordId) ?? '';
	}

	set(recordId: number, documentType: string): void {
		if (documentType) {
			this.documentTypes.set(recordId, documentType);
		} else {
			this.documentTypes.delete(recordId);
		}
	}
}
