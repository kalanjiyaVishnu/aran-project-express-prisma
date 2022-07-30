import nodemailer from "nodemailer"

type params = { to: string; subject: string; text: string; html: string }
async function sendMail({ to, subject, text, html }: params) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.G_USER_ACC,
      pass: process.env.G_PASS,
    },
  })
  await transporter.sendMail({
    from: "admin@aranwindows.com",
    to,
    subject,
    text,
    html,
  })

  // console.log("Message sent: %s", info.messageId)
  // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
}

export default sendMail
