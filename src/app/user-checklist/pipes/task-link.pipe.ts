import { Pipe, PipeTransform } from '@angular/core';

export interface TaskRouterLink {
	routerLink: (string | { outlets: { dialog: string[] } })[] | string;
	fragment?: string;
	external?: boolean;
}

@Pipe({
	name: 'taskLink',
	standalone: false,
})
export class TaskLinkPipe implements PipeTransform {
	private readonly links: Record<string, TaskRouterLink> = {
		storageRedeemed: {
			routerLink: [{ outlets: { dialog: ['storage', 'add'] } }],
			fragment: 'promo',
		},
		legacyContact: {
			routerLink: [{ outlets: { dialog: ['account'] } }],
			fragment: 'legacy-contact',
		},
		archiveSteward: {
			routerLink: [{ outlets: { dialog: ['settings'] } }],
			fragment: 'legacy-planning',
		},
		archiveProfile: {
			routerLink: [{ outlets: { dialog: ['profile'] } }],
		},
		firstUpload: {
			routerLink:
				'https://permanent.zohodesk.com/portal/en/kb/articles/upload-your-first-file',
			external: true,
		},
		publishContent: {
			routerLink:
				'https://permanent.zohodesk.com/portal/en/kb/articles/how-to-publish',
			external: true,
		},
	};

	public transform(value: string, ..._: unknown[]): TaskRouterLink | undefined {
		if (this.links[value]) {
			return this.links[value];
		}
	}
}
