import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

export const asyncHandler =
  <P = ParamsDictionary>(
    fn: (req: Request<P>, res: Response, next: NextFunction) => Promise<unknown> | unknown
  ): RequestHandler<P> =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
