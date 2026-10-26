import { Controller, UseGuards, Put, Param, Body, ParseIntPipe, Post, Get, Delete } from '@nestjs/common';
import { HasRoles } from '../auth/jwt/has-roles';
import { JwtRole } from '../auth/jwt/jwt-role';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { JwtRolesGuard } from '../auth/jwt/jwt-roles.guard';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
export class AddressController {

    constructor(private addressService: AddressService) {}

    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Post() // http://localhost:3000/address -> POST
    create(@Body() address: CreateAddressDto) {
        return this.addressService.create(address);
    }
    
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get() // http://localhost:3000/address -> GET
    findAll() {
        return this.addressService.findAll();
    }
    
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Get('user/:id_user') // http://localhost:3000/address/user/1 -> GET
    findByUser(@Param('id_user', ParseIntPipe) id_user: number) {
        return this.addressService.findByUser(id_user);
    }

    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Put(':id') // http://localhost:3000/address/:id -> PUT
    update(@Param('id', ParseIntPipe) id: number, @Body() address: UpdateAddressDto) {
        return this.addressService.update(id, address);
    }
    
    @HasRoles(JwtRole.ADMIN, JwtRole.CLIENT)
    @UseGuards(JwtAuthGuard, JwtRolesGuard)
    @Delete(':id') // http://localhost:3000/address/:id -> DELETE
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.addressService.delete(id);
    }

}
