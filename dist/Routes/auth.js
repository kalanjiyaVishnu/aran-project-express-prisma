"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = require("bcrypt");
const express_1 = require("express");
const jsonwebtoken_1 = require("jsonwebtoken");
const constants_1 = require("../utils/constants");
const prisma_1 = __importDefault(require("../utils/prisma"));
const authRoute = (0, express_1.Router)();
authRoute.post("/register", async (req, res) => {
    console.log(req.body);
    const { name, pass, email, role } = req.body;
    if (!name || !pass || !email) {
        return res.status(300).send({ err: "Fields Required" });
    }
    if (!email.includes("@") || email.length < 8) {
        return res.status(300).send({ err: "Email Invalid" });
    }
    try {
        const hashedPasss = await (0, bcrypt_1.hash)(pass, 10);
        const user = await prisma_1.default.user.create({
            data: {
                name: name,
                email: email,
                pwd: hashedPasss,
                role: role ? role : client_1.Role.BASE,
            },
        });
        return res.json({ user });
    }
    catch (err) {
        return res.status(300).json({ err });
    }
});
authRoute.get("/me", async (req, res) => {
    if (!req.userId) {
        return res.send({ err: "UnAuth" });
    }
    const user = await prisma_1.default.user.findFirst({
        where: { id: req.userId },
    });
    !user && res.send({ err: "UnAuth" });
    return res.json({ user });
});
authRoute.post("/login", async (req, res) => {
    const { email, pass } = req.body;
    if (!pass || !email) {
        return res.status(300).send({ err: "Fields Required" });
    }
    if (!email.includes("@") || email.length < 8) {
        return res.status(300).send({ err: "Email Invalid" });
    }
    const user = await prisma_1.default.user.findFirst({
        where: { email },
    });
    if (!user) {
        return res.status(300).json({ err: "User not Found with Curr Email" });
    }
    const isPassMatch = await (0, bcrypt_1.compare)(pass, user.pwd);
    if (!isPassMatch) {
        return res.status(300).send({ err: "Pass invalid" });
    }
    const token = (0, jsonwebtoken_1.sign)({ userId: user.id }, constants_1.ACCESS_TOKEN, {
        expiresIn: "3d",
    });
    res.cookie("access-token", token);
    return res.json({ user });
});
exports.default = authRoute;
//# sourceMappingURL=auth.js.map