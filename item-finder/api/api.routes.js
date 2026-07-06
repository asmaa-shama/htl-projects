import { Router } from 'express';
import { router as itemsRouter } from './items/items.routes.js';
import { router as locationRouter } from './locations/locations.routes.js';
import {router as imagesRouter } from './images/images.routes.js';
import { router as categoriesRouter } from './category/categories.routes.js';
import { router as borrowedRouter } from './borrowed/borrowed.routes.js';

export const apiRouter = Router();

apiRouter.use('/items', itemsRouter);

apiRouter.use('/locations', locationRouter);
apiRouter.use('/image', imagesRouter);

apiRouter.use('/borrowed', borrowedRouter);
apiRouter.use('/categories', categoriesRouter);

apiRouter.use((req, res, _next) => {
  res.status(404).json({ error: 'Not Found', message: `${req.url} not found.` });
});
