import { Pipe, PipeTransform } from '@angular/core';
import { PrConstantsService } from '@shared/services/pr-constants/pr-constants.service';

@Pipe({
  name: 'prConstants'
})
export class PrConstantsPipe implements PipeTransform {

  constructor(
    private prConstants: PrConstantsService
  ) { }

  transform(value: any, args?: any): any {
    return this.prConstants.translate(value);
  }

}
