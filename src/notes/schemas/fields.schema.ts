import * as Joi from 'joi';

export const idSchema = Joi.number().min(1).label('note id');

export const tagSchema = Joi.string().min(1).label('tag');

export const colorSchema = Joi.string().min(3).label('color');

export const positionSchema = Joi.number()
  .min(1)
  .optional()
  .label('note position');
