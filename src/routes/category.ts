import { Router } from "express";
import { getCategories, getCategory } from "../controllers/category";

import { categoryById } from "../middlewares/category";

const router = Router();

router.get("/categories", getCategories);

router.get("/category/:categoryId", getCategory);

router.param("categoryId", categoryById);

export default router;
