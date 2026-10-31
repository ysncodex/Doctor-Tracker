import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export function validate(schema: ZodType): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return next(
        new ApiError(
          400,
          result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
        )
      );
    }

    const parsed = result.data as { body?: unknown };

    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    next();
  };
}
