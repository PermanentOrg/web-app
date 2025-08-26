import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash';
import { TOOLTIPS } from './tooltips';

@Pipe({
	name: 'prTooltip',
	standalone: false,
})
export class TooltipsPipe implements PipeTransform {
	transform(value: any, args?: any): any {
		return get(TOOLTIPS, value) || value;
	}
}
