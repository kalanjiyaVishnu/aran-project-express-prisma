"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessAndAdmin = exports.verifyAccessToken = void 0;
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = require("jsonwebtoken");
const constants_1 = require("./constants");
const prisma_1 = __importDefault(require("./prisma"));
const verifyAccessToken = async (req, res, next) => {
    console.log('  req.cookies["access-token"]', req.cookies["access-token"]);
    if (!req.cookies["access-token"]) {
        console.log("no cookie sent");
        return next();
    }
    console.log("something");
    let token;
    try {
        token = (0, jsonwebtoken_1.verify)(req.cookies["access-token"], constants_1.ACCESS_TOKEN);
    }
    catch (error) {
        return res.status(200).json({ err: "token Error", sol: "Try Login Again" });
    }
    let user;
    try {
        user = await prisma_1.default.user.findFirst({
            where: { id: token.userId },
        });
    }
    catch (_a) {
        return next();
    }
    if (!user) {
        return res.send({ err: "No User Have that access Token" });
    }
    req.userId = user.id;
    req.userRole = user.role;
    console.log(user.role);
    return next();
};
exports.verifyAccessToken = verifyAccessToken;
const verifyAccessAndAdmin = async (req, res, next) => {
    (0, exports.verifyAccessToken)(req, res, () => {
        if (req.userRole === client_1.Role.ADMIN.toString()) {
            next();
        }
        else
            res.status(200).json({ err: "No Auth To Perfom That Task" });
    });
};
exports.verifyAccessAndAdmin = verifyAccessAndAdmin;
//# sourceMappingURL=authTokenVerify.js.map