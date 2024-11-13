import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

interface Pizza {
  nombre: string;
  tamano: string;
  ingredientes: string[];
  numero: number;
  subtotal: number;
  fecha: string; 
}

@Injectable({
  providedIn: 'root',
})
export class PizzasService {
  ingredientesList: string[] = ['Jamon', 'piña', 'champiñones'];

  constructor(private readonly fb: FormBuilder) {}

  initForm(): FormGroup {
    return this.fb.group({
      nombre: [''],
      tamano: [''],
      ingredientes: this.fb.array(
        this.ingredientesList.map(() => this.fb.control(false))
      ),
      numero: [1],
    });
  }

  registrarPizza(formGroup: FormGroup, pizzas: Pizza[]): Pizza[] {
    const { nombre, tamano, numero } = formGroup.value;
    const ingredientes = this.getIngredientes(formGroup);

    const subtotal = this.calcularSubtotal(tamano, ingredientes, numero);

    const nuevaPizza: Pizza = {
      nombre: nombre,
      tamano: tamano,
      ingredientes: ingredientes,
      numero: numero,
      subtotal: subtotal,
      fecha: new Date().toISOString(),
    };

    // Guardar en localStorage
    let pizzasGuardadas = localStorage.getItem('pizza');
    let listaPizzas: Pizza[] = pizzasGuardadas
      ? JSON.parse(pizzasGuardadas)
      : [];

    listaPizzas.push(nuevaPizza);
    localStorage.setItem('pizza', JSON.stringify(listaPizzas));

    // No limpiar el campo `nombre` para que esté disponible en futuras operaciones
    formGroup.patchValue({
      tamano: '',
      numero: 1,
      ingredientes: this.fb.array(
        this.ingredientesList.map(() => this.fb.control(false))
      ),
    });

    // Mantener el nombre para futuras operaciones
    return listaPizzas;
  }

  getIngredientes(formGroup: FormGroup): string[] {
    return (formGroup.get('ingredientes') as FormArray).controls
      .map((control, i) => (control.value ? this.ingredientesList[i] : null))
      .filter((value) => value !== null) as string[];
  }

  calcularSubtotal(
    tamano: string,
    ingredientesSeleccionados: string[],
    numero: number
  ): number {
    let precioTamano = 0;
    switch (tamano) {
      case 'Chica':
        precioTamano = 40;
        break;
      case 'Mediana':
        precioTamano = 80;
        break;
      case 'Grande':
        precioTamano = 120;
        break;
    }

    let precioIngredientes = Math.min(ingredientesSeleccionados.length, 2) * 10;
    return (precioTamano + precioIngredientes) * numero;
  }

  cargarPizzas(): Pizza[] {
    const datosGuardado = localStorage.getItem('pizza');
    return datosGuardado ? JSON.parse(datosGuardado) : [];
  }

  cargarPizza(formGroup: FormGroup, pizzas: Pizza[]): void {
    const { nombre } = formGroup.value;
    const pizza = pizzas.find((p) => p.nombre === nombre);

    if (pizza) {
      formGroup.patchValue({
        tamano: pizza.tamano,
        numero: pizza.numero,
      });
      this.setIngredientes(formGroup, pizza.ingredientes);
    }
  }

  setIngredientes(formGroup: FormGroup, ingredientes: string[]): void {
    const formArray = formGroup.get('ingredientes') as FormArray;
    formArray.clear();
    this.ingredientesList.forEach((ing) => {
      formArray.push(this.fb.control(ingredientes.includes(ing)));
    });
  }

  borrarPizza(formGroup: FormGroup, pizzas: Pizza[]): Pizza[] {
    const { nombre } = formGroup.value; // Usar el campo `nombre` actual del formulario
    const index = pizzas.findIndex((p) => p.nombre === nombre);
    if (index !== -1) {
      pizzas.splice(index, 1);
      localStorage.setItem('pizza', JSON.stringify(pizzas));
    }
    return pizzas;
  }

  finalizarPedidoPorNombre(nombre: string): number {
    const pizzasGuardadas = localStorage.getItem('pizza');
    let listaPizzas: Pizza[] = pizzasGuardadas
      ? JSON.parse(pizzasGuardadas)
      : [];
    const pizzasDeNombre = listaPizzas.filter(
      (pizza) => pizza.nombre === nombre
    );
    const total = pizzasDeNombre.reduce(
      (sum, pizza) => sum + pizza.subtotal,
      0
    );
    return total;
  }
  obtenerPedidos(): { [key: string]: number } {
    const pizzasGuardadas = localStorage.getItem('pizza');
    let listaPizzas: Pizza[] = pizzasGuardadas
      ? JSON.parse(pizzasGuardadas)
      : [];
    const resumen: { [key: string]: number } = {};
    listaPizzas.forEach((pizza) => {
      if (resumen[pizza.nombre]) {
        resumen[pizza.nombre] += pizza.subtotal;
      } else {
        resumen[pizza.nombre] = pizza.subtotal;
      }
    });
    return resumen;
  }
  obtenerVentasDelDia(): number {
    const pizzasGuardadas = localStorage.getItem('pizza');
    let listaPizzas: Pizza[] = pizzasGuardadas
      ? JSON.parse(pizzasGuardadas)
      : [];
    const hoy = new Date().toISOString().slice(0, 10); 
    const ventasDelDia = listaPizzas.filter(pizza => pizza.fecha.startsWith(hoy)); 
    const totalVentas = ventasDelDia.reduce((sum, pizza) => sum + pizza.subtotal, 0); 
    return totalVentas;
     }

  
  }
