// Datos del titular de la tarjeta
export interface Cardholder {
    identification: Identification;
    name: string;
}

// Identificación del titular (tipo y número)
export interface Identification {
    number: string;
    type:   string;
}
