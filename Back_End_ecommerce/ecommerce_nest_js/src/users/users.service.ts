import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
    ) {}
    //Estamos usando conceptos de APIRest
    create(user: CreateUserDto) {
        const newUser = this.usersRepository.create(user);//Aqui nos crea un nuevo usuario
        return this.usersRepository.save(newUser);//Se lo enviamos a la BD
    }

    findAll() {
        return this.usersRepository.find({ relations: { roles: true } });
    }

    async update(id: number, user: UpdateUserDto) {
        const userFound = await this.usersRepository.findOneBy({id: id}); 

        if (!userFound) {
            throw new HttpException('Usuario no existe', HttpStatus.NOT_FOUND);
        }

        const updatedUser = Object.assign(userFound, user);//Actualiza al usuario
        return this.usersRepository.save(updatedUser);
    }

}
