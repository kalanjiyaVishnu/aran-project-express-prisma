import { ACCESS_TOKEN } from "./constants"
import { NextFunction, Response } from "express"

import jwt from "jsonwebtoken"
import prisma from "./prisma"

const verifyToken = async (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.token
  if (req.cookies["access-token"] || authHeader) {
    const token = req.cookies["access-token"] || authHeader
    try {
      const decoded: any = jwt.verify(token, ACCESS_TOKEN)
      console.log("decoded", decoded)
      let user
      try {
        user = await prisma.user.findFirst({
          where: { id: decoded.userId },
        })
        console.log("user", user)
      } catch {
        return next()
      }

      if (!user) {
        return res.send({ err: "No User Have that access Token" })
      }
      req.userId = user.id
      req.userRole = user.role
      next()
    } catch (error) {
      return res.status(200).json({ err: "Token is not valid" })
    }
  } else {
    return res.status(200).json({ err: "You are not authenticated!" })
  }
}

const verifyTokenAndAuthorization = (
  req: any,
  res: Response,
  next: NextFunction
) => {
  verifyToken(req, res, () => {
    if (req.userId === req.params.id || req.userRole) {
      next()
    } else {
      res.status(200).json({ err: "You are not alowed to do that!" })
    }
  })
}

const verifyTokenAndAdmin = (req: any, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.userRole) {
      next()
    } else {
      res.status(403).json("You are not alowed to do that!")
    }
  })
}

export default {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
}
