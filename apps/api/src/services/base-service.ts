import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import FormData from 'form-data'

export abstract class BaseService {
	constructor() {}

	public async makeRequest(input: {
		url: string
		method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options'
		route?: string
		query?: any
		body?: any
		formData?: FormData
		responseType?: 'json' | 'blob' | 'stream' | 'arraybuffer' | 'text' | 'document'
		options?: any
	}): Promise<any> {
		const config: AxiosRequestConfig = {
			responseType: input.responseType || 'json',
			withCredentials: false,
			params: input.query,
			timeout: 60000,
		}

		if (input.formData) {
			const headers = Object.assign({
				...input.formData.getHeaders(),
				'Content-Length': input.formData.getLengthSync(),
				...input?.options?.headers,
			})

			const response = await axios.request({
				method: 'post',
				url: `${input.url}${input.route ? '/' + input.route : ''}`,
				data: input.formData,
				headers: headers,
				...config,
			})

			return response
		} else if (input.method === 'get') {
			const response = await axios.get(`${input.url}${input.route ? '/' + input.route : ''}`, {
				headers: {},
				...config,
				...input.options,
			})

			return response
		} else {
			const response = await axios[input.method](`${input.url}${input.route ? '/' + input.route : ''}`, input.body, {
				headers: {},
				...config,
				...input.options,
			})

			return response
		}
	}
}
