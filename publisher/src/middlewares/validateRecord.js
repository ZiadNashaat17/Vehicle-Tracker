import Joi from "joi";

const recordSchema = Joi.object({
	deviceId: Joi.string().required(),
	lng: Joi.number().min(-180).max(180).required(),
	lat: Joi.number().min(-90).max(90).required(),
	speed: Joi.number().required(),
	rotation: Joi.number().min(0).max(360).optional(),
	status: Joi.string().valid("Parking", "Idling", "Moving", "Towed").optional(),
	timestamp: Joi.date(),
});

export default (req, res, next) => {
	const { error, value } = recordSchema.validate(req.body, { abortEarly: false });

	if (error) {
		return res.status(400).json({
			errors: error.details.map(err => ({
				field: err.path.join("."),
				message: err.message,
			})),
		});
	}

	req.validatedRecord = value;
	next();
};
