const {z} = require('zod');

const signUpValidator = z.object({
    firstName: z.string().min(2).max(25),
    lastName: z.string().min(2).max(25).optional(),
    email: z.string().email(),
    password: z
        .string()
        .min(8, 'Must be 8 character long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(
          /[^A-Za-z0-9]/,
          'Password must contain at least one special character'
        ),
})

const signInValidator = z.object({
    email: z.string().email(),
    password: z.string(),
})


module.exports = {signUpValidator, signInValidator}