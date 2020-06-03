import { Pipe, PipeTransform } from '@angular/core';
import { get } from 'lodash';
import { TOOLTIPS } from './tooltips';

@Pipe({
  name: 'prTooltip'
})
export class TooltipsPipe implements PipeTransform {

  constructor(
  ) { }

  transform(value: any, args?: any): any {
    return get(TOOLTIPS, value) || value;
  }

}
