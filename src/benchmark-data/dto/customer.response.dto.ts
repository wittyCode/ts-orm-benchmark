import { CustomerEntity } from '../model/customer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty()
  duration: number;
  @ApiProperty()
  count: number;
  @ApiProperty({ type: CustomerEntity })
  data: CustomerEntity[];
}
