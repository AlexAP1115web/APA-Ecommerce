import { Cardholder } from "./card_holder";  // Datos del titular de la tarjeta

// Cuerpo de la petición para generar el token de la tarjeta
export interface CardTokenBody {
    card_number:      string;
    expiration_year:  string;
    expiration_month: number;
    security_code:    string;
    cardholder:       Cardholder;
}
