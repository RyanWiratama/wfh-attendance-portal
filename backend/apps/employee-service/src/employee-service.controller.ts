import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeeService } from './employee-service.service';
import { Role } from '@app/common';

@Controller()
export class EmployeeServiceController {
  constructor(private readonly employeeService: EmployeeService) {}

  @MessagePattern('employee.create')
  async create(
    @Payload()
    data: {
      fullName: string;
      email: string;
      password?: string;
      role?: Role;
      department?: string;
      position?: string;
    },
  ) {
    return this.employeeService.create(data);
  }

  @MessagePattern('employee.find_all')
  async findAll(
    @Payload()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      department?: string;
    },
  ) {
    return this.employeeService.findAll(query);
  }

  @MessagePattern('employee.find_by_id')
  async findById(@Payload() id: number) {
    return this.employeeService.findById(id);
  }

  @MessagePattern('employee.find_by_email')
  async findByEmail(@Payload() email: string) {
    return this.employeeService.findByEmailWithPassword(email);
  }

  @MessagePattern('employee.update')
  async update(
    @Payload()
    payload: {
      id: number;
      data: {
        fullName?: string;
        email?: string;
        password?: string;
        role?: Role;
        department?: string;
        position?: string;
      };
    },
  ) {
    return this.employeeService.update(payload.id, payload.data);
  }

  @MessagePattern('employee.delete')
  async delete(@Payload() id: number) {
    return this.employeeService.softDelete(id);
  }
}
