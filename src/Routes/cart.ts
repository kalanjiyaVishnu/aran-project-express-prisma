import { Router } from "express"
import {
  verifyAccessAndAdmin,
  verifyAccessToken,
} from "../utils/authTokenVerify"
import prisma from "../utils/prisma"
const cartRoute = Router()

cartRoute.get("/items", verifyAccessToken, async (req: any, res) => {
  let cart: any = []
  try {
    cart = await prisma.user.findFirst({
      where: { id: req.userId! },
      select: { cart: true },
    })
  } catch (e) {
    console.log(e)
    return res
      .json({
        err: "No Cart Items for the current User Found",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ data: cart })
})

cartRoute.post("/addItem", async (req: any, res) => {
  const { pid, quantity = 1 } = req.body
  try {
    await prisma.orderLineItem.create({
      data: {
        productId: Number(pid),
        quantity: quantity,
        userId: req.userId,
      },
    })
    // await prisma.user.update({
    //   where: {
    //     id: req.userId,
    //   },
    //   data: {
    //     cart: {
    //       connect: {
    //        id:
    //       },
    //     },
    //   },
    // })
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "This Item Not Added to the Cart",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ success: true })
})

cartRoute.put("/:pid", verifyAccessAndAdmin, async (req, res) => {
  let product
  try {
    product = await prisma.orderLineItem.update({
      data: {
        ...req.body,
      },
      where: {
        id: Number(req.params.pid),
      },
    })
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "Product Not Updated Found",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ data: product })
})

cartRoute.delete("/:pid", async (req, res) => {
  let product
  try {
    product = await prisma.orderLineItem.delete({
      where: {
        id: Number(req.params.pid),
      },
    })
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "No Product Not Deleted",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ data: product })
})
export default cartRoute
