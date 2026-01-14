import { PartialType } from '@nestjs/swagger';
import { CreateIPODto } from './create-ipo.dto';

export class UpdateIPODto extends PartialType(CreateIPODto) {}
