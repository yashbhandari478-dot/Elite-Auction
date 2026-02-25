import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'toMaxValue'
})
export class ToMaxValuePipe implements PipeTransform {
  /**
   * Transform: Gets the max value from an array of objects
   * Usage: (someArray | toMaxValue: 'propertyName')
   */
  transform(array: any[], property: string): number {
    if (!array || !property) return 1;
    const values = array.map(item => item[property] || 0);
    return Math.max(...values, 1);
  }
}
