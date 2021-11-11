const BaseJoi = require('joi');
const sanitizeHTML = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHTML(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)



module.exports.museumSchema = Joi.object({
    museum: Joi.object({
        title: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        price: Joi.number().required().min(0)
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required()
    }).required()
})