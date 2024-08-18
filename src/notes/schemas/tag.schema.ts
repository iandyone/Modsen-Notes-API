import * as Joi from 'joi';

export const tagSchema = Joi.string().min(2);
