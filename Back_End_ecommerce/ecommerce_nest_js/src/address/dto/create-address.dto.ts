import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateAddressDto {

    @IsNotEmpty()
    @IsString()
    address: string;
    
    @IsNotEmpty()
    @IsString()
    neighborhood: string;

    @IsNotEmpty()
    @IsNumber()
    id_user: number;

}
