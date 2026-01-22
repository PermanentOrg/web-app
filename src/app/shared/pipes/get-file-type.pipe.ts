import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'prGetFileType',
	standalone: false,
})
export class GetFileTypePipe implements PipeTransform {
	private types = {
		'type.folder.private': 'Folder',
		'type.folder.public': 'Folder',
		'type.record.image': 'Image',
		'type.record.video': 'Video',
		'type.record.web_archive': 'Web Archive',
	};

	transform(value: string): string {
		return this.types[value] || 'Unknown';
	}
}
