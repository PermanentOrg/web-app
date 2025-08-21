declare global {
	interface Window {
		/** Prevents the Google Maps API from being loaded */
		doNotLoadGoogleMapsAPI?: boolean;

		Stripe?: (...args: unknown[]) => any;

		MSStream?: unknown;
	}
}

export {};
