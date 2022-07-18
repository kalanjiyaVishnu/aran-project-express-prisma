import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import authRoute from "./Routes/auth"
import userRoute from "./Routes/user"
import { verifyAccessToken } from "./utils/authTokenVerify"
import prisma from "./utils/prisma"
import { config } from "dotenv"
import productRoute from "./Routes/product"
import cartRoute from "./Routes/cart"
import orderRoute from "./Routes/order"
const app = express()

async function main() {
  config()

  console.log(await prisma.cateGory.findMany())

  app.use(cors())
  app.use(express.json())
  app.use(cookieParser())

  app.use(verifyAccessToken)

  app.use("/user", userRoute)
  app.use("/product", productRoute)
  app.use("/cart", cartRoute)
  app.use("/order", orderRoute)
  app.use("/auth", authRoute)
}

main()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Running on http://localhost:${process.env.PORT}`)
    })
  })
  .catch((e) => console.log(e))
  .finally(() => prisma.$disconnect)
