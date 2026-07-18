export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'range' | 'date';
export type CardVariant = 'default' | 'elevated' | 'outlined';
export type ModalSize = 'sm' | 'md' | 'lg';

export interface Lead {
  id: string;
  carId: string;
  carName: string;
  name: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'appt_scheduled' | 'negotiating' | 'sold' | 'lost';
  source: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  color: string;
  body: string;
  engine: string;
  transmission: string;
  drivetrain: string;
  mpg?: number;
  images: string[];
  status: 'draft' | 'active' | 'featured' | 'sold';
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  id: string;
  leadId: string;
  vehicleId: string;
  type: 'test_drive' | 'inspection';
  dateTime: string;
  status: 'scheduled' | 'completed' | 'no_show';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'bdc';
  dealershipId: string;
  avatar?: string;
}
