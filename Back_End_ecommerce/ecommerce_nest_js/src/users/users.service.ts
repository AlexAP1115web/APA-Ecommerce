import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  create(dto: CreateUserDto) {
    return this.usersRepo.save(this.usersRepo.create(dto));
  }

  findAll() {
    return this.usersRepo.find();
  }

  async findOne(id: number) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    await this.usersRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return this.usersRepo.remove(user);
  }
}