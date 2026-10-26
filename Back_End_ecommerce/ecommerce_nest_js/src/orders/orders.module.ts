import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderHasProducts } from './order_has_products.entity';
import { User } from '../users/user.entity';
import { Address } from '../address/address.entity';
import { Product } from '../products/product.entity';
import { JwtStrategy } from '../auth/jwt/jwt.strategy';

@Module({
  imports: [ TypeOrmModule.forFeature([ Order, OrderHasProducts, User, Address, Product ]) ],
  providers: [OrdersService, JwtStrategy],
  controllers: [OrdersController]
})
export class OrdersModule {}
