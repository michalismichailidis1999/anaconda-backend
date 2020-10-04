"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Imports
var express_1 = __importDefault(require("express"));
var dotenv_1 = require("dotenv");
var cors_1 = __importDefault(require("cors"));
var helmet_1 = __importDefault(require("helmet"));
// Connect to database
var db_1 = __importDefault(require("./config/db"));
db_1.default.connect(function (err) {
    if (err) {
        console.log(err.message);
        process.exit(1);
    }
    console.log("Connected to Database...");
});
// Routes imports
var user_1 = __importDefault(require("./routes/user"));
var category_1 = __importDefault(require("./routes/category"));
var product_1 = __importDefault(require("./routes/product"));
var message_1 = __importDefault(require("./routes/message"));
var payment_1 = __importDefault(require("./routes/payment"));
var order_1 = __importDefault(require("./routes/order"));
// Admin routes imports
var product_2 = __importDefault(require("./adminRoutes/product"));
var category_2 = __importDefault(require("./adminRoutes/category"));
var message_2 = __importDefault(require("./adminRoutes/message"));
var user_2 = __importDefault(require("./adminRoutes/user"));
var order_2 = __importDefault(require("./adminRoutes/order"));
dotenv_1.config();
var app = express_1.default();
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
var port = process.env.PORT || 5000;
app.listen(port, function () { return console.log("Server started on port " + port + "..."); });
