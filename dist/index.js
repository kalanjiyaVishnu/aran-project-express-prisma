"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./Routes/auth"));
const cart_1 = __importDefault(require("./Routes/cart"));
const order_1 = __importDefault(require("./Routes/order"));
const product_1 = __importDefault(require("./Routes/product"));
const user_1 = __importDefault(require("./Routes/user"));
const prisma_1 = __importDefault(require("./utils/prisma"));
const verifyToken_1 = __importDefault(require("./utils/verifyToken"));
const app = (0, express_1.default)();
async function main() {
    (0, dotenv_1.config)();
    app.use((0, express_session_1.default)({
        resave: false,
        saveUninitialized: false,
        secret: "process.env.SESSION_SECRET",
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            sameSite: true,
        },
    }));
    app.set("trust proxy", 1);
    app.use((0, cors_1.default)({
        origin: ["http://localhost:3000", "https://aranwindows.vercel.app"],
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: false,
        optionsSuccessStatus: 204,
        credentials: true,
    }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    app.get("/", (_, res) => {
        console.log("hey bob");
        res.status(200).json("Hello Bob");
    });
    app.use("/auth", auth_1.default);
    app.use("/user", user_1.default);
    app.use("/product", product_1.default);
    app.use("/cart", verifyToken_1.default.verifyTokenAndAuthorization, cart_1.default);
    app.use("/order", order_1.default);
    app.get("/delete-all", async (_, res) => {
        try {
            await prisma_1.default.product.deleteMany({});
            await prisma_1.default.user.deleteMany({});
            await prisma_1.default.order.deleteMany({});
            return res.send({ message: "All data deleted" });
        }
        catch (error) {
            return res.send({ Errr: error });
        }
    });
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