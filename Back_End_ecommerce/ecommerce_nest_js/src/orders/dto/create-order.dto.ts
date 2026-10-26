// DTO que define la estructura del cuerpo (body) necesario para crear una orden
export class CreateOrderDto {
    // ID del usuario/cliente que realiza la compra
    id_client: number;

    // ID de la dirección de entrega seleccionada por el cliente
    id_address: number;

    // Listado de productos y sus cantidades que componen la orden
    products: Array<{ 
        id: number;        // ID del producto
        quantity: number;  // Cantidad comprada de este producto
    }>;
}
