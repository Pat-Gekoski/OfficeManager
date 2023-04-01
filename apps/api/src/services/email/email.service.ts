import sgMail, { MailDataRequired } from '@sendgrid/mail'
import { BaseService } from '../base-service'
import { config } from '../../../config'

export default class EmailService extends BaseService {
	private sendLiveEmails: boolean

	constructor() {
		super()
		sgMail.setApiKey(config.sendGrid.apiKey)
		this.sendLiveEmails = config.sendGrid.sendLiveEmails
	}

	public async sendEmail(emailData: MailDataRequired | MailDataRequired[]) {
		try {
			if (!this.sendLiveEmails) {
				if (Array.isArray(emailData)) {
					for (const recipient of emailData) {
						console.info(`Surpressed sending email to ${recipient.to}`, new Date())
					}
				} else {
					console.info(`Surpressed sending email to ${emailData.to}`, new Date())
				}
				return
			}
			await sgMail.send(emailData)
		} catch (err) {
			console.error(err)
			throw err
		}
	}
}
