import { Router } from "express"
import {
  verifyAccessAndAdmin,
  verifyAccessToken,
} from "../utils/authTokenVerify"
import prisma from "../utils/prisma"
const orderRoute = Router()

orderRoute.get("/items", verifyAccessToken, async (req: any, res) => {
  let orders: any = []
  try {
    orders = await prisma.user.findFirst({
      where: { id: req.userId! },
      select: {
        Order: {
          include: {
            _count: true,
            OrderItem: true,
          },
        },
      },
    })
  } catch (e) {
    console.log(e)
    return res
      .json({
        err: "No orders Items for the current User Found",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ data: orders })
})

orderRoute.post("/buy", async (req: any, res) => {
  const { pid, quantity = 1, address, orderId, shipmentName } = req.body
  try {
    await prisma.user.update({
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
    })
    // await prisma.orderItem.create({
    //   data: {
    //     productId: Number(pid),
    //     quantity: quantity,
    //     address,
    //     orderId: Number(orderId),
    //     shipmentName,
    //   },
    // })
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

orderRoute.post("/addItem", async (req: any, res) => {
  const { pid, quantity = 1, address, orderId, shipmentName } = req.body
  try {
    await prisma.orderItem.create({
      data: {
        productId: Number(pid),
        quantity: quantity,
        address,
        orderId: Number(orderId),
        shipmentName,
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

orderRoute.put("/:pid", verifyAccessAndAdmin, async (req, res) => {
  let product
  try {
    product = await prisma.orderItem.update({
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

orderRoute.delete("/:pid", async (req, res) => {
  let product
  try {
    product = await prisma.orderItem.delete({
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
export default orderRoute
