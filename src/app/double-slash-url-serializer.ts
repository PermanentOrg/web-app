import { DefaultUrlSerializer, UrlTree } from '@angular/router';

// Angular serializes auxiliary outlet routes with //, e.g. /app/(primary//dialog:path).
// Some servers (e.g. WP Engine redirect rules) normalize // to / before matching,
// breaking 301 redirects. This serializer encodes // as /__/ in the URL so it
// survives server-side normalization, and decodes it back when parsing.
export class DoubleSlashUrlSerializer extends DefaultUrlSerializer {
	override parse(url: string): UrlTree {
		return super.parse(url.replace(/\/__\/(\w+:)/g, '//$1'));
	}

	override serialize(tree: UrlTree): string {
		return super.serialize(tree).replace(/\/\/(\w+:)/g, '/__/$1');
	}
}
