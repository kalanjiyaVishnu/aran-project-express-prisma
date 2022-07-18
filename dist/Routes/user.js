"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authTokenVerify_1 = require("../utils/authTokenVerify");
const prisma_1 = __importDefault(require("../utils/prisma"));
const userRoute = (0, express_1.Router)();
userRoute.get("/", authTokenVerify_1.verifyAccessAndAdmin, async (_, res) => {
    let users = [];
    try {
        users = await prisma_1.default.user.findMany({
            include: {
                cart: {
                    include: {
                        product: true,
                    },
                },
                Order: {
                    include: {
                        OrderItem: true,
                        _count: true,
                    },
                },
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No User Found",
        })
            .status(500)
            .end();
    }
    return res.status(200).json(users);
});
userRoute.get("/:id", async (req, res) => {
    let user;
    try {
        user = await prisma_1.default.user.findFirst({
            include: {
                cart: {
                    include: {
                        product: true,
                    },
                },
            },
            where: {
                id: Number(req.params.id),
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No User Found",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ user });
});
exports.default = userRoute;
//# sourceMappingURL=user.js.map