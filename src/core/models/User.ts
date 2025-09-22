import { UserRole } from './UserRole';

export interface User {
  id?: string;
  name?: string | null;
  email: string;
  password?: string;
  role?: UserRole;
}
