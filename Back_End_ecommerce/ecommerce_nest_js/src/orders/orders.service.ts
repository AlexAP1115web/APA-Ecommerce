import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { OrderHasProducts } from './order_has_products.entity';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {

    constructor(
        // Inyección del repositorio de la entidad Order (tabla 'orders')
        @InjectRepository(Order) private ordersRepository: Repository<Order>,
        // Inyección del repositorio de la entidad OrderHasProducts (tabla intermedia 'order_has_products')
        @InjectRepository(OrderHasProducts) private ordersHasProductsRepository: Repository<OrderHasProducts>,
    ) {}

    // Método para crear una orden directamente (sin pasarela de pago como Mercado Pago)
    async create(order: CreateOrderDto) {
        // 1. Preparamos la entidad de la orden con los datos principales (id_client, id_address)
        const newOrder = this.ordersRepository.create(order);
        
        // 2. Guardamos la orden en la base de datos para generar su ID único
        const savedOrder = await this.ordersRepository.save(newOrder);

        // 3. Recorremos el listado de productos para registrarlos en la tabla intermedia 'order_has_products'
        for (const product of order.products) {
            const ohp = new OrderHasProducts();
            ohp.id_order = savedOrder.id;       // Asociamos el ID de la orden creada
            ohp.id_product = product.id;         // ID del producto comprado
            ohp.quantity = product.quantity;     // Cantidad de unidades
            await this.ordersHasProductsRepository.save(ohp);
        }

        // 4. Retornamos la orden registrada
        return savedOrder;
    }

    // Obtener todas las órdenes con sus relaciones (usuario, dirección y productos)
    findAll() {
        return this.ordersRepository.find({ relations: { user: true, address: true, orderHasProducts: { product: true } } })
    }
    
    // Obtener todas las órdenes de un cliente específico
    findByClient(idClient: number) {
        return this.ordersRepository.find({ 
            relations: { user: true, address: true, orderHasProducts: { product: true } },
            where: { id_client: idClient },
        })
    }

    // Actualizar el estado de la orden a 'DESPACHADO'
    async updateStatus(id: number) {
        const orderFound = await this.ordersRepository.findOneBy({id: id});
        if (!orderFound) {
            throw new HttpException('Orden no encontrada', HttpStatus.NOT_FOUND);
        }
        const updatedOrder = Object.assign(orderFound, { status: 'DESPACHADO' });
        return this.ordersRepository.save(updatedOrder);
    }

}
