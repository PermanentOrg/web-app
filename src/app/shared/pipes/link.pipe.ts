import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'link',
	standalone: false,
})
export class LinkPipe implements PipeTransform {
	transform(text: any, ...args: any[]): any {
		if (!text || !text.length || text.indexOf('http') === 0) {
			return text;
		}

		return `http://${text}`;
	}
}
