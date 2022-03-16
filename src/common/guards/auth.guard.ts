import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

const STRATEGIES = ['basic'];

export class AuthGuard extends PassportAuthGuard(STRATEGIES) {}
