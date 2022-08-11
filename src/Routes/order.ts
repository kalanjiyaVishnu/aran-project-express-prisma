import { Router } from "express"
import {
  verifyAccessAndAdmin,
  verifyAccessToken,
} from "../utils/authTokenVerify"
import sendMail from "../utils/mailHandle"
import prisma from "../utils/prisma"

const stripe = require("stripe")(process.env.STRIPE_SEC_KEY)
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
            OrderItem: {
              include: {
                product: true,
              },
            },
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
  console.log("-----------order init")

  console.log(req.body)

  const { pid, quantity = 1, address, shipmentName } = req.body
  try {
    const data = await prisma.user.update({
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
      select: {
        email: true,
        name: true,
      },
    })
    const p = await prisma.product.findFirst({ where: { id: Number(pid) } })
    console.log("after ordering ", data)
    console.log(p)

    // payment
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "USD",
              product_data: {
                name: p!.name,
              },
              unit_amount: p!.price * 100,
            },
            quantity,
          },
        ],
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/cancel`,
      })
      await sendMail({
        to: data.email,
        html: `
        
            <p>Hi 
            ${data.name} 
            The Required Prodcut You Purchaced Have Been TRacked And PayMent Have
            Been Made Down and Will Let you When We Can Get It At Your DoorStep
          </p>
          <h1>Thank You</h1>
          <a href="">Continue Your Shopping</a>
          <a href="${session.url}">Plese pay the amount</a>
        `,
        subject: "Order Confirmation",
        text: "Confirmation For Your Order",
      })
      return res.status(200).json({ success: true, url: session.url })
    } catch (e) {
      return res.status(500).json({ error: e.message })
    }
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "This Item Not Added to the Cart",
      })
      .status(500)
      .end()
  }
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
    await sendMail({
      to: "kalanjiyavishnu@outlook.com",
      html: "adsfadsf",
      subject: "asdf",
      text: "adsf",
    })
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

orderRoute.get("/clear-orders", verifyAccessAndAdmin, async (_req, res) => {
  try {
    await prisma.order.deleteMany()
  } catch (error) {
    console.log(error)
    res.send({ err: error.message }).end()
  }
  res.send({ success: true })
})

export default orderRoute
