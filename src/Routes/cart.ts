import { Router } from "express"
import {
  verifyAccessAndAdmin,
  verifyAccessToken,
} from "../utils/authTokenVerify"
import prisma from "../utils/prisma"
const cartRoute = Router()

cartRoute.get("/items", verifyAccessToken, async (req: any, res) => {
  let user: any = []
  try {
    user = await prisma.user.findFirst({
      where: { id: req.userId! },
      include: {
        cart: {
          include: {
            product: true,
          },
        },
        Order: true,
      },
    })
    console.log(user)
  } catch (e) {
    console.log(e)
    return res
      .json({
        err: "No Cart Items for the current User Found",
      })
      .status(500)
      .end()
  }
  const { cart } = user
  return res.status(200).json({ data: cart })
})

cartRoute.post("/addItem", async (req: any, res) => {
  const { pid, quantity = 1 } = req.body
  try {
    const addedProduct = await prisma.orderLineItem.create({
      data: {
        productId: Number(pid),
        quantity: quantity,
        userId: req.userId,
      },
    })
    console.log("addedProduct", addedProduct)

    res.status(200).json({ success: true, id: addedProduct.id })
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
  return
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
  console.log(req.params.pid)

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
