import * as Joi from 'joi';

export const colorSchema = Joi.string().min(3);
