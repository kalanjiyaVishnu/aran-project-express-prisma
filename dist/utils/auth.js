"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = void 0;
const constants_1 = require("./constants");
const jsonwebtoken_1 = require("jsonwebtoken");
const getPrismaClient_1 = __importDefault(require("../getPrismaClient"));
const verifyAccessToken = async (req, res, next) => {
    if (!req.cookies["access-token"]) {
        return next();
    }
    let token;
    try {
        token = (0, jsonwebtoken_1.verify)(req.cookies["access-token"], constants_1.ACCESS_TOKEN);
    }
    catch (error) {
        return res.status(400).json({ err: "token Error" });
    }
    let user;
    try {
        user = await getPrismaClient_1.default.user.findFirst({
            where: { id: token.userId },
        });
    }
    catch (_a) {
        return next();
    }
    if (!user) {
        return next();
    }
    req.userId = user.id;
    return next();
};
exports.verifyAccessToken = verifyAccessToken;
//# sourceMappingURL=auth.js.map