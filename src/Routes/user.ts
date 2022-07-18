import { User } from "@prisma/client"
import { Router } from "express"
import { verifyAccessAndAdmin } from "../utils/authTokenVerify"
import getClient from "../utils/prisma"
const userRoute = Router()

userRoute.get("/", verifyAccessAndAdmin, async (_, res) => {
  let users: User[] = []
  try {
    users = await getClient.user.findMany({
      include: {
        cart: {
          include: {
            product: true,
          },
        },
        Order: {
          include: {
            OrderItem: true,
            _count: true,
          },
        },
      },
    })
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "No User Found",
      })
      .status(500)
      .end()
  }

  return res.status(200).json(users)
})

userRoute.get("/:id", async (req, res) => {
  let user
  try {
    user = await getClient.user.findFirst({
      include: {
        cart: {
          include: {
            product: true,
          },
        },
      },

      where: {
        id: Number(req.params.id),
      },
    })

    // const res = await getClient.user.update({
    //   where: { id: req.params.id },
    //   data`: {
    //     cartItems: {
    //       create: {
    //         productId: "8665b913-046f-433b-b3e6-02608f875a07",
    //         quantityBought: 190,
    //       },
    //     },
    //   },
    // })

    // const res = await getClient.user.update({
    //   where: { id: req.params.id },
    //   data: {
    //     cartItems: {
    //       delete: {
    //         id: "72ece5bc-9ad2-4bd6-a7a4-5905f3929ab9",
    //       },
    //     },
    //   },
    // })

    // console.log(res)
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "No User Found",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ user })
})
export default userRoute
