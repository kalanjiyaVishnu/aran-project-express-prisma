"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authTokenVerify_1 = require("../utils/authTokenVerify");
const prisma_1 = __importDefault(require("../utils/prisma"));
const productRoute = (0, express_1.Router)();
productRoute.get("/", async (_, res) => {
    let products = [];
    try {
        products = await prisma_1.default.product.findMany({
            orderBy: {
                createdAt: "desc",
            },
            where: {
                deletedAt: null,
            },
            include: {
                cateGory: true,
                _count: true,
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No Product Found",
        })
            .status(500)
            .end();
    }
    console.log(await prisma_1.default.product.findMany({
        orderBy: {
            createdAt: "desc",
        },
        where: {
            NOT: {
                deletedAt: null,
            },
        },
        include: {
            cateGory: true,
            _count: true,
        },
    }));
    return res.status(200).json({ data: products });
});
productRoute.get("/:pid", async (req, res) => {
    let product;
    try {
        product = await prisma_1.default.product.findFirst({
            where: {
                id: Number(req.params.pid),
            },
        });
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No Product Found",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ data: product });
});
productRoute.get("/get/categories", async (_, res) => {
    let CateGories;
    try {
        CateGories = await prisma_1.default.cateGory.findMany();
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "No CateGories Found",
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ data: CateGories });
});
productRoute.post("/add", authTokenVerify_1.verifyAccessAndAdmin, async (req, res) => {
    const { name, available, price, categories } = req.body;
    let product;
    try {
        if (categories) {
            product = await prisma_1.default.product.create({
                data: {
                    name,
                    available,
                    price,
                    cateGory: {
                        connectOrCreate: categories.map((category) => {
                            return {
                                create: {
                                    name: category,
                                },
                                where: {
                                    name: category,
                                },
                            };
                        }),
                    },
                },
            });
        }
        else {
            product = await prisma_1.default.product.create({
                data: {
                    name,
                    available,
                    price,
                },
            });
        }
    }
    catch (e) {
        console.log(e);
        return res
            .json({
            err: "Product Not Added to the database",
            msg: e.message,
        })
            .status(500)
            .end();
    }
    return res.status(200).json({ data: product });
});
productRoute.put("/:pid", authTokenVerify_1.verifyAccessAndAdmin, async (req, res) => {
    let product;
    try {
        if (req.body.images) {
            const productToBeUpdated = await prisma_1.default.product.findUnique({
                where: {
                    id: Number(req.params.pid),
                },
            });
            const _a = req.body, { images } = _a, others = __rest(_a, ["images"]);
            productToBeUpdated.images.push(...images);
            console.log(productToBeUpdated.images);
            product = await prisma_1.default.product.update({
                data: Object.assign({ images: productToBeUpdated.images }, others),
                where: {
                    id: Number(req.params.pid),
                },
            });
        }
        else {
            product = await prisma_1.default.product.update({
                data: Object.assign({}, req.body),
                where: {
                    id: Number(req.params.pid),
                },
            });
        }
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
productRoute.delete("/:pid", async (req, res) => {
    let product;
    let date = new Date();
    try {
        product = await prisma_1.default.product.update({
            where: {
                id: Number(req.params.pid),
            },
            data: {
                deletedAt: date,
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
exports.default = productRoute;
//# sourceMappingURL=product.js.map