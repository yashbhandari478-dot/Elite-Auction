import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productFilter'
})
export class ProductFilterPipe implements PipeTransform {
  transform(products: any[], status: string): number {
    if (!products || !Array.isArray(products)) {
      return 0;
    }
    return products.filter(product => product.status === status).length;
  }
}
