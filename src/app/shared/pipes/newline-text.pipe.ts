import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
	name: 'newlineText',
	standalone: false,
})
export class NewlineTextPipe implements PipeTransform {
	transform(text: any, ...args: any[]): any {
		if (!text || !text.length) {
			return text;
		}

		return '<p>' + text.replace(/\n/g, '</p><p>') + '</p>';
	}
}
