export interface ExpenseUpdateDTO {
  id: number;
  status: string;
  expiration_multiplier: number;
  first_expiration_date: string;
  second_expiration_date: string;
}