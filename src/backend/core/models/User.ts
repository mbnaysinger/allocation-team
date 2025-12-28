import { UserRole } from './UserRole';

export interface User {
  id?: string;
  email: string;
  password?: string;
  role?: UserRole;
  personIds?: string[];
}
