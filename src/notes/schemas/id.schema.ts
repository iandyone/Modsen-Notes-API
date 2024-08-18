import * as Joi from 'joi';

export const idSchema = Joi.number().min(1);
