// Tipo de identificación devuelto por Mercado Pago;
// min_length y max_length indican la longitud permitida
export interface IdentificationType {
    id:         string;
    name:       string;
    type:       string;
    min_length: number;
    max_length: number;
}
