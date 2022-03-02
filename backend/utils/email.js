const nodemailer = require('nodemailer')

const sendEmail = async (options) => {
   const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
			type: 'login',
         user: process.env.EMAIL_OF_SENDER,
         pass: process.env.EMAIL_PASSWORD,
      },
   })

   const mailOptions = {
		from: 'Office Manager Team <office-manager@protonmail.com>',
		to: options.email,
		subject: options.subject,
		text: options.message
   }

	await transporter.sendMail(mailOptions)
}

module.exports = sendEmail