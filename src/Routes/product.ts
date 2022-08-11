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
productRoute.get("/get/categories", async (_, res) => {
  let CateGories
  try {
    CateGories = await prisma.cateGory.findMany()
  } catch (e) {
    console.log(e)
    return res
      .json({
        err: "No CateGories Found",
      })
      .status(500)
      .end()
  }

  return res.status(200).json({ data: CateGories })
})

productRoute.get("/getByCat/:cat", async (req, res) => {
  let cat = req.params.cat
  try {
    let catProducts = await prisma.cateGory.findMany({
      where: {
        name: cat,
      },
      select: {
        Product: {
          take: 10,
        },
      },
    })
    return res.status(200).json({ data: catProducts[0]?.Product || [] })
  } catch (e) {
    console.log(e)
    return res
      .json({
        err: "No CateGories Found",
        sol: `${cat} this is not availble try searching for other categories`,
      })
      .status(200)
      .end()
  }
})

productRoute.post("/add", verifyAccessAndAdmin, async (req, res) => {
  interface userProductInputs {
    name: string
    available: boolean
    price: number
    categories?: Array<string>
  }

  const { name, available, price, categories, images }: userProductInputs =
    req.body
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
          images,
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
          images,
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

// const addAllProduct = async () => {
//   interface userProductInputs {
//     name: string
//     available: boolean
//     price: number
//     categories?: Array<string>
//     desc: string
//     size: Array<string>
//     thumb: string
//     images: Array<string>
//   }

//   productData.map(
//     async ({ name, price, categories, desc, size, thumb, images }) => {
//       try {
//         if (categories) {
//           await prisma.product.create({
//             data: {
//               desc,
//               size,
//               thumb,
//               images,
//               name,
//               price: Number(price),
//               cateGory: {
//                 connectOrCreate: categories.map((category) => {
//                   return {
//                     create: {
//                       name: category,
//                     },
//                     where: {
//                       name: category,
//                     },
//                   }
//                 }),
//               },
//             },
//           })
//         } else {
//           await prisma.product.create({
//             data: {
//               name,
//               price: Number(price),
//             },
//           })
//         }
//       } catch (e) {
//         console.log(e)
//       }
//     }
//   )
// }
// addAllProduct()

export default productRoute
