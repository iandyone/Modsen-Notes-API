import * as Joi from 'joi';
import {
  colorSchema,
  idSchema,
  positionSchema,
  tagSchema,
} from './fields.schema';

export const noteSchema = Joi.object({
  id: idSchema,
  title: Joi.string().min(1).label('title'),
  description: Joi.string().allow('').optional().label('description'),
  tags: Joi.array().items(tagSchema).optional().label('tags list'),
  timestamp: Joi.number().optional().label('last update date'),
  position: positionSchema,
  color: colorSchema,
});

export const updateNotesPositionsSchema = Joi.array()
  .items(
    Joi.object({
      id: idSchema.required(),
      position: positionSchema.required(),
    }),
  )
  .required();
