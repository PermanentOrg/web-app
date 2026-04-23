import { DoubleSlashUrlSerializer } from './double-slash-url-serializer';

describe('DoubleSlashUrlSerializer', () => {
	let serializer: DoubleSlashUrlSerializer;

	beforeEach(() => {
		serializer = new DoubleSlashUrlSerializer();
	});

	describe('serialize', () => {
		it('encodes // as /__/ in auxiliary outlet URLs', () => {
			const tree = serializer.parse('/app/(private//dialog:storage/add)');

			expect(serializer.serialize(tree)).toBe(
				'/app/(private/__/dialog:storage/add)',
			);
		});

		it('leaves URLs without auxiliary outlets unchanged', () => {
			const tree = serializer.parse('/app/private');

			expect(serializer.serialize(tree)).toBe('/app/private');
		});

		it('does not encode // in query parameter values', () => {
			const tree = serializer.parse('/app/private?redirect=http://example.com');

			expect(serializer.serialize(tree)).not.toContain('/__/');
		});
	});

	describe('parse', () => {
		it('decodes /__/ back to // before parsing', () => {
			const withEncoded = serializer.parse(
				'/app/(private/__/dialog:storage/add)',
			);
			const withRaw = serializer.parse('/app/(private//dialog:storage/add)');

			expect(serializer.serialize(withEncoded)).toBe(
				serializer.serialize(withRaw),
			);
		});

		it('leaves URLs without /__/ unchanged', () => {
			const tree = serializer.parse('/app/private');

			expect(serializer.serialize(tree)).toBe('/app/private');
		});
	});

	describe('round-trip', () => {
		it('parse(serialize(tree)) produces an equivalent tree', () => {
			const original =
				'/app/(private//dialog:storage/add)?promoCode=TellYourStory';
			const tree = serializer.parse(original);
			const serialized = serializer.serialize(tree);
			const reparsed = serializer.parse(serialized);

			expect(serializer.serialize(reparsed)).toBe(serialized);
		});
	});
});
