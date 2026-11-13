import { Role } from './auth.types';

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  role: Role;
  position?: string;
  department?: string;
  workStartTime?: string;
  workEndTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeInput {
  employeeCode?: string;
  fullName: string;
  email: string;
  password?: string;
  role: Role;
  position?: string;
  department?: string;
  workStartTime?: string;
  workEndTime?: string;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  email?: string;
  password?: string;
  role?: Role;
  position?: string;
  department?: string;
  workStartTime?: string;
  workEndTime?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
