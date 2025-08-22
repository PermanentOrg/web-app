import { Pipe, PipeTransform } from '@angular/core';
import { ArchiveType } from '@models/archive-vo';

@Pipe({
	name: 'archiveTypeName',
	standalone: false,
})
export class ArchiveTypeNamePipe implements PipeTransform {
	public transform(type: ArchiveType): string {
		return `${this.getName(type)} Archive`;
	}

	private getName(type: ArchiveType): string {
		switch (type) {
			case 'type.archive.person':
				return 'Personal';
			case 'type.archive.group':
			case 'type.archive.family':
				return 'Group';
			case 'type.archive.organization':
			case 'type.archive.nonprofit':
				return 'Organizational';
		}
	}
}
