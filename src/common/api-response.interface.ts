import ApiError from './api-error.interface';

export interface ApiResponses<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
}
