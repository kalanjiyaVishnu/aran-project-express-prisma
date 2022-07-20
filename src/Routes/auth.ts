import { Role, User } from "@prisma/client"
import { compare, hash } from "bcrypt"
import { Router } from "express"
import { sign } from "jsonwebtoken"
import { ACCESS_TOKEN } from "../utils/constants"
import prisma from "../utils/prisma"

const authRoute = Router()

authRoute.post("/register", async (req, res) => {
  console.log(req.body)

  const { name, pass, email, role } = req.body
  if (!name || !pass || !email) {
    return res.status(300).send({ err: "Fields Required" })
  }

  if (!email.includes("@") || email.length < 8) {
    return res.status(300).send({ err: "Email Invalid" })
  }

  try {
    const hashedPasss = await hash(pass, 10)
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        pwd: hashedPasss,
        role: role ? role : Role.BASE,
      },
    })
    return res.json({ user })
  } catch (err) {
    return res.status(300).json({ err })
  }
})
authRoute.get("/me", async (req: any, res) => {
  if (!req.userId) {
    return res.send({ err: "UnAuth" })
  }
  const user = await prisma.user.findFirst({
    where: { id: req.userId },
  })

  !user && res.send({ err: "UnAuth" })

  return res.json({ user })
})

// authRoute.get("/logout", async (req, res) => {})
authRoute.post("/login", async (req, res) => {
  const { email, pass }: { email: string; pass: string } = req.body

  if (!pass || !email) {
    return res.status(300).send({ err: "Fields Required" })
  }

  if (!email.includes("@") || email.length < 8) {
    return res.status(300).send({ err: "Email Invalid" })
  }

  const user: User | null = await prisma.user.findFirst({
    where: { email },
  })

  if (!user) {
    return res.status(300).json({ err: "User not Found with Curr Email" })
  }

  const isPassMatch = await compare(pass, user!.pwd)

  if (!isPassMatch) {
    return res.status(300).send({ err: "Pass invalid" })
  }

  const token = sign({ userId: user!.id }, ACCESS_TOKEN, {
    expiresIn: "3d",
  })
  //   expires after 3 days
  // var now = new Date()
  // var time = now.getTime()
  // var expireTime = time + 1000 * 36000
  // now.setTime(expireTime)
  res.cookie("access-token", token)

  return res.json({ user })
})
export default authRoute
