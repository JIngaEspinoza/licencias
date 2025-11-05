import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

function rucIsValid(ruc?: string): boolean {
  if (!ruc) return false;
  const clean = ruc.replace(/\D/g, '');
  if (!/^\d{11}$/.test(clean)) return false;
  if (!/^(10|15|17|20)/.test(clean)) return false;
  const d = clean.split('').map(Number);
  const weights = [5,4,3,2,7,6,5,4,3,2];
  const sum = weights.reduce((acc, w, i) => acc + w * d[i], 0);
  const rem = sum % 11;
  let check = 11 - rem;
  if (check === 10) check = 0;
  if (check === 11) check = 1;
  return check === d[10];
}

export function IsRUC(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsRUC',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) { return rucIsValid(value); },
        defaultMessage(args?: ValidationArguments) {
          return `${args?.property || 'ruc'} inválido`;
        },
      },
    });
  };
}
