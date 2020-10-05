"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// Connect to database
const db_1 = __importDefault(require("./config/db"));
db_1.default.connect((err) => {
    if (err) {
        console.log(err.message);
        process.exit(1);
    }
    console.log("Connected to Database...");
});
// Routes imports
const user_1 = __importDefault(require("./routes/user"));
const category_1 = __importDefault(require("./routes/category"));
const product_1 = __importDefault(require("./routes/product"));
const message_1 = __importDefault(require("./routes/message"));
const payment_1 = __importDefault(require("./routes/payment"));
const order_1 = __importDefault(require("./routes/order"));
// Admin routes imports
const product_2 = __importDefault(require("./adminRoutes/product"));
const category_2 = __importDefault(require("./adminRoutes/category"));
const message_2 = __importDefault(require("./adminRoutes/message"));
const user_2 = __importDefault(require("./adminRoutes/user"));
const order_2 = __importDefault(require("./adminRoutes/order"));
dotenv_1.config();
const app = express_1.default();
// Middlewares
app.use(cors_1.default());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// Helmet
app.use(helmet_1.default());
// Routes
app.use("/api", user_1.default);
app.use("/api", category_1.default);
app.use("/api", product_1.default);
app.use("/api", message_1.default);
app.use("/api", payment_1.default);
app.use("/api", order_1.default);
// Admin Routes
app.use("/api", user_2.default);
app.use("/api", product_2.default);
app.use("/api", category_2.default);
app.use("/api", message_2.default);
app.use("/api", order_2.default);
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}...`));
