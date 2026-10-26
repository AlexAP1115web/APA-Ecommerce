import { HttpService } from '@nestjs/axios';  // Cliente HTTP para consumir la API de Mercado Pago
import { Injectable, HttpException } from '@nestjs/common';  // Injectable para la inyección de dependencias y HttpException para el manejo de errores
import { AxiosResponse, AxiosError } from 'axios';  // Tipos de la respuesta y del error de Axios
import { Observable, catchError, map } from 'rxjs';  // Observable (respuesta de HttpService), catchError para capturar errores y map para transformar la respuesta
import { MERCADO_PAGO_API, MERCADO_PAGO_HEADERS } from '../config/config';  // URL base de la API y encabezados con el token de acceso
import { IdentificationType } from './models/identification_type';  // Modelo de tipos de identificación
import { Installment } from './models/installment';  // Modelo de cuotas (meses)
import { CardTokenBody } from './models/card_token_body';  // Datos para generar el token de la tarjeta
import { CardTokenResponse } from './models/card_token_response';  // Respuesta al generar el token
import { PaymentResponse } from './models/payment_response';  // Respuesta del pago
import { PaymentBody } from './models/payment_body';  // Datos para procesar el pago
import { Repository } from 'typeorm';  // Repositorio para realizar operaciones en la base de datos
import { Order } from '../orders/order.entity';  // Entidad de la tabla orders
import { InjectRepository } from '@nestjs/typeorm';  // Inyección de repositorios en el constructor
import { OrderHasProducts } from '../orders/order_has_products.entity';  // Entidad de la tabla order_has_products

// Servicio que concentra la comunicación con la API de Mercado Pago
@Injectable()
export class MercadoPagoService {

    // httpService realiza las peticiones GET y POST a Mercado Pago;
    // los repositorios guardan la orden y sus productos en la base de datos
    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Order) private ordersRepository: Repository<Order>,
        @InjectRepository(OrderHasProducts) private ordersHasProductsRepository: Repository<OrderHasProducts>,
    ) {}

    // Obtiene los tipos de identificación aceptados por Mercado Pago (DNI, RFC, etc.)
    getIdentificationTypes(): Observable<IdentificationType[]> {
        return this.httpService.get(MERCADO_PAGO_API + '/identification_types', { headers: MERCADO_PAGO_HEADERS }).pipe(
            // Si Mercado Pago responde con error, se reenvía con su mismo código de estado
            catchError((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status);
            })
        // Se devuelve únicamente el cuerpo (data) de la respuesta
        ).pipe(map((resp: AxiosResponse<IdentificationType[]>) => resp.data));
    }

    // Consulta las cuotas (meses) disponibles para la tarjeta;
    // con los primeros 6 dígitos (BIN) Mercado Pago identifica el banco y el tipo de tarjeta
    getInstallments(firstSixDigits: number, amount: number): Observable<Installment> {
        return this.httpService.get(MERCADO_PAGO_API + `/payment_methods/installments?bin=${firstSixDigits}&amount=${amount}`, { headers: MERCADO_PAGO_HEADERS }).pipe(
            catchError((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status);
            })
        // La API responde con un arreglo; se toma el primer elemento
        ).pipe(map((resp: AxiosResponse<Installment[]>) => resp.data[0]));
    }

    // Envía los datos de la tarjeta y Mercado Pago devuelve un token;
    // ese token se usa para el pago, así los datos de la tarjeta no se almacenan
    createCardToken(cardTokenBody: CardTokenBody): Observable<CardTokenResponse> {
        return this.httpService.post(
            // public_key: llave pública de prueba de la cuenta de Mercado Pago
            MERCADO_PAGO_API + `/card_tokens?public_key=TEST-8568eec6-7fc0-48dc-b15a-d6a9278057e1`,
            cardTokenBody, 
            { headers: MERCADO_PAGO_HEADERS }
        ).pipe(
            catchError((error: AxiosError) => {
                throw new HttpException(error.response.data, error.response.status);
            })
        ).pipe(map((resp: AxiosResponse<CardTokenResponse>) => resp.data));
    }
    
    // Procesa el pago en Mercado Pago y registra la orden en MySQL
    async createPayment(paymentBody: PaymentBody): Promise<Observable<PaymentResponse>> {
        console.log('--- Petición recibida en createPayment ---');
        console.log(JSON.stringify(paymentBody, null, 2));

        // Valida que la orden venga completa; de lo contrario responde con error 400
        if (!paymentBody.order || !paymentBody.order.id_client || !paymentBody.order.id_address || !paymentBody.order.products) {
            throw new HttpException('Falta el objeto "order" o alguno de sus campos obligatorios ("id_client", "id_address", "products")', 400);
        }

        // Normalizamos los datos numéricos enviados a Mercado Pago.
        // `transaction_amount` debe ser numérico y con máximo 2 decimales;
        // un redondeo previo evita el error 4037 (Invalid transaction_amount)
        // causado por imprecisiones de punto flotante (ej. 100.10000000000001).
        paymentBody.transaction_amount = Math.round(Number(paymentBody.transaction_amount) * 100) / 100;
        if (!Number.isFinite(paymentBody.transaction_amount) || paymentBody.transaction_amount <= 0) {
            throw new HttpException('transaction_amount debe ser un número mayor que 0', 400);
        }
        // Se asegura que installments sea numérico e issuer_id sea texto
        paymentBody.installments = Number(paymentBody.installments);
        if (paymentBody.issuer_id !== undefined && paymentBody.issuer_id !== null) {
            paymentBody.issuer_id = String(paymentBody.issuer_id);
        }

        // 1. Creamos y guardamos la orden en la tabla 'orders' con los datos recibidos (id_client, id_address)
        const newOrder = this.ordersRepository.create(paymentBody.order);
        const savedOrder = await this.ordersRepository.save(newOrder);

        // 2. Registramos cada producto de la orden en la tabla intermedia 'order_has_products'
        for (const product of paymentBody.order.products) {
            const ohp = new OrderHasProducts();
            ohp.id_order = savedOrder.id;
            ohp.id_product = product.id;
            ohp.quantity = product.quantity;
            await this.ordersHasProductsRepository.save(ohp);
        }
        
        // 3. Eliminamos el objeto 'order' del cuerpo para enviar a Mercado Pago solo los datos que su API espera
        delete paymentBody.order;

        // 4. Enviamos la petición de pago a la API de Mercado Pago
        return this.httpService.post(
            MERCADO_PAGO_API + '/payments',
            paymentBody, 
            { headers: MERCADO_PAGO_HEADERS }
        ).pipe(
            catchError((error: AxiosError) => {
                console.error('Error detallado de Mercado Pago:', error.response?.data || error.message);
                throw new HttpException(error.response?.data || 'Error en el servicio de Mercado Pago', error.response?.status || 500);
            })
        ).pipe(map((resp: AxiosResponse<PaymentResponse>) => resp.data));
    }

}
