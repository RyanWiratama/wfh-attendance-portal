export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export interface User {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  role: Role;
  position?: string;
  department?: string;
}
