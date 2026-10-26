import { Cardholder } from "./card_holder";  // Datos del titular de la tarjeta

// Respuesta de Mercado Pago al generar el token;
// el campo id es el token que se utiliza para el pago
export interface CardTokenResponse {
    id:                   string;
    public_key:           string;
    first_six_digits:     string;
    expiration_month:     number;
    expiration_year:      number;
    last_four_digits:     string;
    cardholder:           Cardholder;
    status:               string;
    date_created:         Date;
    date_last_updated:    Date;
    date_due:             Date;
    luhn_validation:      boolean;
    live_mode:            boolean;
    require_esc:          boolean;
    card_number_length:   number;
    security_code_length: number;
}
