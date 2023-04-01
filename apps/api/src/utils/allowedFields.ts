const setAllowedFields = (obj: any, ...allowedFields: string[]) => {
	const newObj = {}
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el]
	})
	return newObj
}

export { setAllowedFields }
