import { Product } from "@prisma/client"
import { Router } from "express"
import { verifyAccessAndAdmin } from "../utils/authTokenVerify"
import prisma from "../utils/prisma"
const productRoute = Router()

productRoute.get("/", async (_, res) => {
  let products: Product[] = []
  try {
    products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        deletedAt: null,
      },
      include: {
        cateGory: true,
        _count: true,
      },
    })
  } catch (e) {
    console.log(e)
    return res
      .json({
        err: "No Product Found",
      })
      .status(500)
      .end()
  }
  console.log(
    await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          deletedAt: null,
        },
      },
      include: {
        cateGory: true,
        _count: true,
      },
    })
  )

  return res.status(200).json({ data: products })
})

productRoute.get("/:pid", async (req, res) => {
  let product
  try {
    product = await prisma.product.findFirst({
      where: {
        id: Number(req.params.pid),
      },
    })
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "No Product Found",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ data: product })
})

productRoute.post("/add", verifyAccessAndAdmin, async (req, res) => {
  interface userProductInputs {
    name: string
    available: boolean
    price: number
    categories?: Array<string>
  }

  const { name, available, price, categories }: userProductInputs = req.body
  let product
  try {
    if (categories) {
      // const cats = await prisma.cateGory.createMany({
      //   data: category.map((name: string) => ({ name })),
      //   skipDuplicates: true,
      // })

      // console.log(cats)
      product = await prisma.product.create({
        data: {
          name,
          available,
          price,
          cateGory: {
            connectOrCreate: categories.map((category) => {
              return {
                create: {
                  name: category,
                },
                where: {
                  name: category,
                },
              }
            }),
          },
        },
      })
    } else {
      product = await prisma.product.create({
        data: {
          name,
          available,
          price,
        },
      })
    }
  } catch (e) {
    console.log(e)

    return res
      .json({
        err: "Product Not Added to the database",
        msg: e.message,
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ data: product })
})

productRoute.put("/:pid", verifyAccessAndAdmin, async (req, res) => {
  let product: Product
  try {
    if (req.body.images) {
      const productToBeUpdated = await prisma.product.findUnique({
        where: {
          id: Number(req.params.pid),
        },
      })

      const { images, ...others } = req.body

      productToBeUpdated!.images.push(...images)

      console.log(productToBeUpdated!.images)

      product = await prisma.product.update({
        data: {
          images: productToBeUpdated!.images,
          ...others,
        },
        where: {
          id: Number(req.params.pid),
        },
      })
    } else {
      product = await prisma.product.update({
        data: {
          ...req.body,
        },
        where: {
          id: Number(req.params.pid),
        },
      })
    }
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

productRoute.delete("/:pid", async (req, res) => {
  let product
  let date = new Date()
  try {
    product = await prisma.product.update({
      where: {
        id: Number(req.params.pid),
      },
      data: {
        deletedAt: date,
      },
    })
    // product = await prisma.product.delete({
    //   where: {
    //     id: Number(req.params.pid),
    //   },
    // })
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
export default productRoute
