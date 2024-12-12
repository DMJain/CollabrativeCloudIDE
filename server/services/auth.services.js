const JWT = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const { randomBytesGenerator, hash } = require("../lib/utils/encrypt");
const User = require("../models/user.model");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET === "") {
  throw new Error("JWT_SECRET is not defined");
}

class AuthService {
  static generateToken(user) {
    return JWT.sign(user, JWT_SECRET);
  }

  static async signUpService(data) {
    const { firstName, lastName, email, password } = data;

    const salt = randomBytesGenerator(16);

    try {
      const user = await User.create({
        firstName,
        lastName,
        email,
        salt,
        password: hash(password, salt),
      });

      const token = AuthService.generateToken({
        _id: user._id,
        role: user.role,
      });
      return token;
    } catch (err) {
      console.log("Error creating", err);
      throw new Error("Internal Server Error");
    }
  }

  static async signInService(data) {
    const { email, password } = data;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("User with email ${email} not found");
    }

    if (hash(password, user.salt) !== user.password) {
      throw new Error("Invalid Password or Email");
    }

    const token = AuthService.generateToken({
      _id: user._id,
      role: user.role,
    });

    return token;
  }

  static decodeUserToken(token) {
    try {
      const payload = JWT.verify(token, JWT_SECRET);
      return payload;
    } catch (err) {
      return false;
    }

  }
}

module.exports = AuthService;
