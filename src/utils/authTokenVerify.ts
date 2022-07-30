import { Role } from "@prisma/client"
import { NextFunction } from "express"
import { verify } from "jsonwebtoken"
import { ACCESS_TOKEN } from "./constants"
import prisma from "./prisma"

export const verifyAccessToken = async (req: any, res: any, next: any) => {
  console.log("something");
  
  if (!req.cookies["access-token"]) {
    console.log("no cookie sent")

    return next()
  }
  console.log("something")

  let token: any
  try {
    token = verify(req.cookies["access-token"], ACCESS_TOKEN)
  } catch (error) {
    return res.status(400).json({ err: "token Error" })
  }

  let user
  try {
    user = await prisma.user.findFirst({
      where: { id: token.userId },
    })
  } catch {
    return next()
  }

  if (!user) {
    return res.send({ err: "No User Have that access Token" })
  }

  req.userId = user.id
  req.userRole = user.role
  console.log(user.role)

  return next()
}

export const verifyAccessAndAdmin = async (
  req: any,
  res: any,
  next: NextFunction
) => {
  verifyAccessToken(req, res, () => {
    if (req.userRole === Role.ADMIN.toString()) {
      next()
    } else res.status(400).json({ err: "No Auth To Perfom That Task" })
  })
}
