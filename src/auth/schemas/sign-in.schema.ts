import * as Joi from 'joi';

export const signInSchema = Joi.object({
  email: Joi.string().min(10).required().label('email'),
  // TODO: обновить длину пароля
  password: Joi.string().min(4).required().label('password'),
});
