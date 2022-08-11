import cookieParser from "cookie-parser"
import cors from "cors"
import { config } from "dotenv"
import express from "express"
import session from "express-session"
import authRoute from "./Routes/auth"
import cartRoute from "./Routes/cart"
import orderRoute from "./Routes/order"
import productRoute from "./Routes/product"
import userRoute from "./Routes/user"
import prisma from "./utils/prisma"
import verifyToken from "./utils/verifyToken"

const app = express()

async function main() {
  config()

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: "process.env.SESSION_SECRET",
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: true,
        // httpOnly: true,
      },
    })
  )
  app.set("trust proxy", 1)
  app.use(
    cors({
      origin: ["http://localhost:3000", "https://aranwindows.vercel.app"],
      // origin: "https://aranwindows.vercel.app",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,
      credentials: true,
    })
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get("/", (_, res) => {
    console.log("hey bob")
    res.status(200).json("Hello Bob")
  })
  // app.use(verifyAccessToken)
  app.use("/auth", authRoute)
  app.use("/user", userRoute)
  app.use("/product", productRoute)
  app.use("/cart", verifyToken.verifyTokenAndAuthorization, cartRoute)
  app.use("/order", orderRoute)
  app.get("/delete-all", async (_, res) => {
    try {
      await prisma.product.deleteMany({})
      await prisma.user.deleteMany({})
      await prisma.order.deleteMany({})
      return res.send({ message: "All data deleted" })
    } catch (error) {
      return res.send({ Errr: error })
    }
  })
}

main()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Running on http://localhost:${process.env.PORT}`)
    })
  })
  .catch((e) => console.log(e))
  .finally(() => prisma.$disconnect)
