import { Pipe, PipeTransform } from '@angular/core';
import { HasThumbnails, GetThumbnail } from '@models/get-thumbnail';

@Pipe({
	name: 'getThumbnail',
	standalone: false,
})
export class GetThumbnailPipe implements PipeTransform {
	transform(item: HasThumbnails): string | undefined {
		return GetThumbnail(item);
	}
}
