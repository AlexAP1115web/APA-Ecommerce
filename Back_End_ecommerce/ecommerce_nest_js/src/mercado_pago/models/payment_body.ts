import { Identification } from "./card_holder";  // Tipo y número de identificación
import { CreateOrderDto } from '../../orders/dto/create-order.dto';  // DTO de la orden que se guarda en la base de datos

// Cuerpo de la petición para procesar el pago;
// order se guarda en la base de datos y se elimina antes de enviarlo a Mercado Pago
export interface PaymentBody {
    transaction_amount: number;
    token:              string;
    installments:       number;
    issuer_id:          string;
    payment_method_id:  string;
    payer:              Payer;
    order: CreateOrderDto
}

// Datos del pagador
export interface Payer {
    email:          string;
    identification: Identification;
}
