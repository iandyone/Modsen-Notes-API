import * as Joi from 'joi';
import { tagSchema } from './tag.schema';
import { colorSchema } from './color.schema';
import { idSchema } from './id.schema';

export const noteSchema = Joi.object({
  id: idSchema,
  title: Joi.string().min(1),
  description: Joi.string().allow('').optional(),
  tags: Joi.array().items(tagSchema).optional(),
  timestamp: Joi.number().optional(),
  position: Joi.number().min(1).optional(),
  color: colorSchema,
});

export const updateNotesPositionsSchema = Joi.array()
  .items(
    Joi.object({
      id: Joi.number().required(),
      position: Joi.number().min(0).required(),
    }),
  )
  .required();
