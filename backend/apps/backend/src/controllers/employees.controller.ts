import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Inject,
  ParseIntPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import {
  EMPLOYEE_SERVICE,
  Role,
  Roles,
  RolesGuard,
} from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Employees (HR Admin)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('employees')
export class EmployeesController {
  constructor(
    @Inject(EMPLOYEE_SERVICE)
    private readonly employeeClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Daftar seluruh karyawan (Pagination & Search)' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('department') department?: string,
  ) {
    return firstValueFrom(
      this.employeeClient.send('employee.find_all', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        search,
        department,
      }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Tambah data karyawan baru' })
  async create(
    @Body()
    dto: {
      fullName: string;
      email: string;
      password?: string;
      role?: Role;
      department?: string;
      position?: string;
    },
  ) {
    return firstValueFrom(this.employeeClient.send('employee.create', dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail data karyawan berdasarkan ID' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.employeeClient.send('employee.find_by_id', id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Ubah informasi data karyawan' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      fullName?: string;
      email?: string;
      password?: string;
      role?: Role;
      department?: string;
      position?: string;
    },
  ) {
    return firstValueFrom(
      this.employeeClient.send('employee.update', { id, data: dto }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hapus / nonaktifkan karyawan (Soft delete)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.employeeClient.send('employee.delete', id));
  }
}
