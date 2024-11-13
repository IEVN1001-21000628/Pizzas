import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PizzasService } from '../agregar/pizzas.service';

interface Pizza {
  nombre: string;
  tamano: string;
  ingredientes: string[];
  numero: number;
  subtotal: number;
  fecha: string;
}

@Component({
  selector: 'app-pizza',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './agregar.component.html',
  styles: ``,
})
export default class AgregarComponent implements OnInit {
  formGroup!: FormGroup;
  pizzas: Pizza[] = [];
  pedidos: { [key: string]: number } = {}; // Añadir propiedad para los pedidos
  total: number = 0;
  nombreActual: string = '';
  totalventasDia: number = 0;

  constructor(public pizzaService: PizzasService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.formGroup = this.pizzaService.initForm();
    this.addIngredientesCheckboxes(); // Agrega los checkboxes para los ingredientes
    this.pizzas = this.pizzaService.cargarPizzas();
  }

  addIngredientesCheckboxes() {
    const ingredientesFormArray = this.formGroup.get('ingredientes') as FormArray;
    ingredientesFormArray.clear(); // Limpia los ingredientes actuales si hay alguno
    this.pizzaService.ingredientesList.forEach(() => {
      ingredientesFormArray.push(this.fb.control(false)); // Agrega un control por cada ingrediente
    });
  }

  registrarPizza(): void {
    this.pizzas = this.pizzaService.registrarPizza(this.formGroup, this.pizzas);
    this.nombreActual = this.formGroup.get('nombre')?.value; // Guarda el nombre actual para usarlo en el total
    this.formGroup.reset();
    this.addIngredientesCheckboxes(); // Restablece los checkboxes después de registrar
  }

  cargarPizza() {
    this.pizzaService.cargarPizza(this.formGroup, this.pizzas);
  }

  borrarPizza() {
    this.pizzas = this.pizzaService.borrarPizza(this.formGroup, this.pizzas);
  }

  imprimirTabla() {
    this.pizzas = this.pizzaService.cargarPizzas();
  }

  get ingredientesFormArray(): FormArray {
    return this.formGroup.get('ingredientes') as FormArray;
  }

  finalizarPedido(): void {
    this.pedidos = this.pizzaService.obtenerPedidos(); // Obtener los pedidos por nombre
  }
  calcularVentasDelDia(): void { 
    this.totalventasDia = this.pizzaService.obtenerVentasDelDia(); // Obtener ventas del día }
  }
}
