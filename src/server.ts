interface User {
  first_name: string;
  last_name: string;
  email: string;
  id: string;
  password: string | undefined;
  created_at: string | undefined;
  role: number;
}

interface Category {
  id: string;
  name: string;
  created_at: string | undefined;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  price: number;
  image: string;
  image2: string;
  image3: string;
  image4: string;
  description: string;
  quantity: number;
  sold: number | undefined;
  on_sale: number;
  new_price: number;
  created_at: string | undefined;
  updated_at: string | undefined;
  rate: number;
  code: string;
  weight: number;
}

interface Comment {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  product_id: string;
}

interface Message {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  checked: number;
  created_at: string;
}

interface Order {
  id: string;
  status: string;
  total_price: number;
  created_at: string;
  customer: string;
  paymentMethod: string;
  paid: number;
  checked: number;
}

declare global {
  namespace Express {
    interface Request {
      user: User;
      auth: string;
      category: Category;
      product: Product;
      comment: Comment;
      message: Message;
      order: Order;
    }
  }
}

// Imports
import express, { Application } from "express";
import { config } from "dotenv";
import cors from "cors";
import { MysqlError } from "mysql";
import helmet from "helmet";

// Connect to database
import db from "./config/db";

db.connect((err: MysqlError) => {
  if (err) {
    console.log(err.message);
    process.exit(1);
  }

  console.log("Connected to Database...");
});

// Routes imports
import userRouter from "./routes/user";
import categoryRouter from "./routes/category";
import productRouter from "./routes/product";
import messageRouter from "./routes/message";
import paymentRouter from "./routes/payment";
import orderRouter from "./routes/order";

// Admin routes imports
import adminProductRouter from "./adminRoutes/product";
import adminCategoryRouter from "./adminRoutes/category";
import adminMessageRouter from "./adminRoutes/message";
import adminUserRouter from "./adminRoutes/user";
import adminOrderRouter from "./adminRoutes/order";

config();

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Helmet
app.use(helmet());

// Routes
app.use("/api", userRouter);
app.use("/api", categoryRouter);
app.use("/api", productRouter);
app.use("/api", messageRouter);
app.use("/api", paymentRouter);
app.use("/api", orderRouter);

// Admin Routes
app.use("/api", adminUserRouter);
app.use("/api", adminProductRouter);
app.use("/api", adminCategoryRouter);
app.use("/api", adminMessageRouter);
app.use("/api", adminOrderRouter);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}...`));
