export class CreateUserDto {
//Nos sirve para saber que información enviamos en la petición
    name: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
    image?: string;
    notification_token?: string;
}
