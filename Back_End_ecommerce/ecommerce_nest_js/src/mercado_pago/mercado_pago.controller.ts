import { Controller, UseGuards, Param, Body, Post, Get } from '@nestjs/common';  // Decoradores para definir rutas y leer los datos de la petición
import { HasRoles } from '../auth/jwt/has-roles';  // Define los roles con acceso a cada ruta
import { JwtRole } from '../auth/jwt/jwt-role';  // Enumeración de roles (ADMIN y CLIENT)
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';  // Guard que exige un token válido
import { JwtRolesGuard } from '../auth/jwt/jwt-roles.guard';  // Guard que valida el rol contenido en el token
import { MercadoPagoService } from './mercado_pago.service';  // Servicio de Mercado Pago
import type { CardTokenBody } from './models/card_token_body';  // Modelo del body para generar el token (import type por ser interfaz)
import type { PaymentBody } from './models/payment_body';  // Modelo del body para el pago


// Prefijo de ruta base: http://localhost:3000/mercadopago
@Controller('mercadopago')
export class MercadoPagoController {

    // Inyección del servicio para utilizar sus métodos
    constructor(private mercadoPagoService: MercadoPagoService) {}

    // GET http://localhost:3000/mercadopago/identification_types
    // Consulta los tipos de identificación válidos de Mercado Pago (ej. CC, DNI, RFC)
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get('identification_types')
    getIdentificationTypes() {
        return this.mercadoPagoService.getIdentificationTypes();
    }
    
    // GET http://localhost:3000/mercadopago/installments/:first_six_digits/:amount
    // Consulta las opciones de cuotas disponibles para una tarjeta según los primeros 6 dígitos y el monto
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get('installments/:first_six_digits/:amount')
    getInstallments(
        @Param('first_six_digits') firstSixDigits: number, 
        @Param('amount') amount: number
    ) {
        console.log('firstSixDigits', firstSixDigits);
        console.log('amount', amount);
        
        return this.mercadoPagoService.getInstallments(firstSixDigits, amount);
    }
    
    // POST http://localhost:3000/mercadopago/card_token
    // Genera el token seguro de la tarjeta de crédito/débito directamente con Mercado Pago
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post('card_token')
    createCardToken(@Body() cardTokenBody: CardTokenBody) {
        return this.mercadoPagoService.createCardToken(cardTokenBody);
    }
    
    // POST http://localhost:3000/mercadopago/payments
    // Guarda la orden en la BD (orders y order_has_products) y procesa el cobro en Mercado Pago
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post('payments')
    createPayment(@Body() paymentBody: PaymentBody) {
        return this.mercadoPagoService.createPayment(paymentBody);
    }

}
