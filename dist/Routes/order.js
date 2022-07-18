"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authTokenVerify_1 = require("../utils/authTokenVerify");
const prisma_1 = __importDefault(require("../utils/prisma"));
const orderRoute = (0, express_1.Router)();
orderRoute.get("/items", authTokenVerify_1.verifyAccessToken, async (req, res) => {
    let orders = [];
    try {
        orders = await prisma_1.default.user.findFirst({
            where: { id: req.userId },
            select: {
                Order: {
                    include: {
                        _count: true,
                        OrderItem: true,
                    },
                },
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No orders Items for the current User Found",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ data: orders });
});
orderRoute.post("/buy", async (req, res) => {
    const { pid, quantity = 1, address, shipmentName } = req.body;
    try {
        await prisma_1.default.user.update({
            where: {
                id: Number(req.userId),
            },
            data: {
                Order: {
                    create: {
                        OrderItem: {
                            create: {
                                productId: Number(pid),
                                quantity: quantity,
                                address,
                                shipmentName,
                            },
                        },
                    },
                },
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
orderRoute.post("/addItem", async (req, res) => {
    const { pid, quantity = 1, address, orderId, shipmentName } = req.body;
    try {
        await prisma_1.default.orderItem.create({
            data: {
                productId: Number(pid),
                quantity: quantity,
                address,
                orderId: Number(orderId),
                shipmentName,
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
orderRoute.put("/:pid", authTokenVerify_1.verifyAccessAndAdmin, async (req, res) => {
    let product;
    try {
        product = await prisma_1.default.orderItem.update({
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
orderRoute.delete("/:pid", async (req, res) => {
    let product;
    try {
        product = await prisma_1.default.orderItem.delete({
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
exports.default = orderRoute;
//# sourceMappingURL=order.js.map