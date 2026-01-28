import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'isFutureDate', async: false })
export class IsFutureDate implements ValidatorConstraintInterface {
  validate(date: any) {
    return new Date(date) > new Date();
  }

  defaultMessage() {
    return 'Date must be in the future';
  }
}