import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//Este es para proteger nuestras rutas
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
