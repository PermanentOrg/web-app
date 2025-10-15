import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class FeatureService {
	private features: Record<string, boolean> = {};

	public ephemeralFolder: any = null;

	enable(featureKey: string) {
		this.features[featureKey] = true;
	}

	disable(featureKey: string) {
		this.features[featureKey] = false;
	}

	isEnabled(featureKey: string): boolean {
		return !!this.features[featureKey];
	}

	reset() {
		this.features = {};
	}
}
