export default interface ApiError {
  field?: string;
  name?: string;
  type?: string; // Name of the error (e.g., 'ValidationError')
  errors: string[]; // Array of error messages (strings)
}
