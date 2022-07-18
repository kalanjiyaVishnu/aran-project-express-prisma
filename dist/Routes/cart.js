"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authTokenVerify_1 = require("../utils/authTokenVerify");
const prisma_1 = __importDefault(require("../utils/prisma"));
const cartRoute = (0, express_1.Router)();
cartRoute.get("/items", authTokenVerify_1.verifyAccessToken, async (req, res) => {
    let cart = [];
    try {
        cart = await prisma_1.default.user.findFirst({
            where: { id: req.userId },
            select: { cart: true },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No Cart Items for the current User Found",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ data: cart });
});
cartRoute.post("/addItem", async (req, res) => {
    const { pid, quantity = 1 } = req.body;
    try {
        await prisma_1.default.orderLineItem.create({
            data: {
                productId: Number(pid),
                quantity: quantity,
                userId: req.userId,
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "This Item Not Added to the Cart",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ success: true });
});
cartRoute.put("/:pid", authTokenVerify_1.verifyAccessAndAdmin, async (req, res) => {
    let product;
    try {
        product = await prisma_1.default.orderLineItem.update({
            data: Object.assign({}, req.body),
            where: {
                id: Number(req.params.pid),
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "Product Not Updated Found",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ data: product });
});
cartRoute.delete("/:pid", async (req, res) => {
    let product;
    try {
        product = await prisma_1.default.orderLineItem.delete({
            where: {
                id: Number(req.params.pid),
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No Product Not Deleted",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ data: product });
});
exports.default = cartRoute;
//# sourceMappingURL=cart.js.map