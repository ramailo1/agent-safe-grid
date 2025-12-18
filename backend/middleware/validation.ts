import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Schema Definitions
const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  gateway: Joi.string().valid('stripe', 'paypal', 'square', 'wise', 'bank_transfer').required(),
  token: Joi.string().required(),
  description: Joi.string().optional()
});

const bankAccountSchema = Joi.object({
  bankName: Joi.string().required().min(2).messages({
    'string.min': 'Bank name must be at least 2 characters',
    'any.required': 'Bank name is required'
  }),
  accountHolderName: Joi.string().required().min(2).messages({
    'string.min': 'Account holder name must be at least 2 characters',
    'any.required': 'Account holder name is required'
  }),
  routingNumber: Joi.string().pattern(/^\d{9}$/).required().messages({
    'string.pattern.base': 'Routing number must be exactly 9 digits',
    'any.required': 'Routing number is required'
  }),
  accountNumber: Joi.string().min(4).max(17).required().messages({
    'string.min': 'Account number must be at least 4 characters',
    'string.max': 'Account number must be at most 17 characters',
    'any.required': 'Account number is required'
  }),
  country: Joi.string().length(2).uppercase().required().messages({
    'string.length': 'Country code must be 2 characters (e.g., US, UK)',
    'any.required': 'Country is required'
  }),
  currency: Joi.string().length(3).uppercase().required().messages({
    'string.length': 'Currency code must be 3 characters (e.g., USD, GBP)',
    'any.required': 'Currency is required'
  })
});

const planSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  limits: Joi.object({
    tokens: Joi.alternatives().try(Joi.number(), Joi.string().valid('Unlimited')),
    users: Joi.alternatives().try(Joi.number(), Joi.string().valid('Unlimited')),
    storageGB: Joi.number()
  }).required(),
  features: Joi.object().optional(),
  isActive: Joi.boolean()
});

// Middleware Factory
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate((req as any).body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => detail.message);
      (res as any).status(400).json({ error: 'Validation Error', details: errors });
      return;
    }

    next();
  };
};

export const validatePayment = validate(paymentSchema);
export const validateBankAccount = validate(bankAccountSchema);
export const validatePlan = validate(planSchema);
