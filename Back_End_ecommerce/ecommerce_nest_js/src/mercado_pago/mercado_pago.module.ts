import { Module } from '@nestjs/common';  // Decorador para definir el módulo
import { MercadoPagoService } from './mercado_pago.service';  // Servicio con la lógica de pagos
import { MercadoPagoController } from './mercado_pago.controller';  // Controlador con las rutas de /mercadopago
import { HttpModule } from '@nestjs/axios';  // Módulo para realizar peticiones HTTP
import { TypeOrmModule } from '@nestjs/typeorm';  // Registro de las entidades que usa el módulo
import { Order } from '../orders/order.entity';  // Entidad de órdenes
import { OrderHasProducts } from '../orders/order_has_products.entity';  // Entidad de productos por orden
import { JwtStrategy } from '../auth/jwt/jwt.strategy';  // Estrategia para validar el token JWT

// Módulo de Mercado Pago: agrupa el controlador, el servicio y las entidades de pagos
@Module({
  // HttpModule permite consumir la API de Mercado Pago
  // y TypeOrmModule registra las entidades para guardar la orden al pagar
  imports: [HttpModule, TypeOrmModule.forFeature([ Order, OrderHasProducts])],
  // JwtStrategy es necesaria para que funcionen los guards de autenticación
  providers: [MercadoPagoService, JwtStrategy],
  controllers: [MercadoPagoController]
})
export class MercadoPagoModule {}