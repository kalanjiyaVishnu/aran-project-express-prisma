"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("./Routes/auth"));
const cart_1 = __importDefault(require("./Routes/cart"));
const order_1 = __importDefault(require("./Routes/order"));
const product_1 = __importDefault(require("./Routes/product"));
const user_1 = __importDefault(require("./Routes/user"));
const authTokenVerify_1 = require("./utils/authTokenVerify");
const prisma_1 = __importDefault(require("./utils/prisma"));
const app = (0, express_1.default)();
async function main() {
    (0, dotenv_1.config)();
    app.use((0, cors_1.default)({
        origin: "http://localhost:3000",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.use(authTokenVerify_1.verifyAccessToken);
    app.get("/", (_, res) => {
        console.log("hey bob");
        res.status(200).json("Hello Bob");
    });
    app.use("/user", user_1.default);
    app.use("/product", product_1.default);
    app.use("/cart", cart_1.default);
    app.use("/order", order_1.default);
    app.use("/auth", auth_1.default);
}
main()
    .then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Running on http://localhost:${process.env.PORT}`);
    });
})
    .catch((e) => console.log(e))
    .finally(() => prisma_1.default.$disconnect);
//# sourceMappingURL=index.js.map