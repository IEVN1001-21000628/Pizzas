import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pizzasap',
  standalone: true
})
export class PizzasapPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
