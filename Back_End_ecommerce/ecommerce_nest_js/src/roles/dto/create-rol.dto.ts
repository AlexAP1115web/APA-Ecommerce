import { IsNotEmpty, IsString } from "class-validator";

export class CreateRolDto {

    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    name: string;
    
    image?: string;
    
    @IsNotEmpty()
    @IsString()
    route: string;

}