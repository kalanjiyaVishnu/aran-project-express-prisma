import cookieParser from "cookie-parser"
import cors from "cors"
import { config } from "dotenv"
import express from "express"
import authRoute from "./Routes/auth"
import cartRoute from "./Routes/cart"
import orderRoute from "./Routes/order"
import productRoute from "./Routes/product"
import userRoute from "./Routes/user"
import { verifyAccessToken } from "./utils/authTokenVerify"
import prisma from "./utils/prisma"
const app = express()

async function main() {
  config()

  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(cookieParser())

  app.use(verifyAccessToken)

  app.get("/", (_, res) => {
    console.log("hey bob")
    res.status(200).json("Hello Bob")
  })
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
