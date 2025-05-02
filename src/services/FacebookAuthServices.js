const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/.env" });

class FacebookAuthServices {
  static async findOrCreateUser(profile, role) {
    try {
      let user;
      const email = profile._json.email || `${profile.id}@facebook.com`;
      const facebookId = profile.id;

      if (role === "freelancer") {
        user = await Freelancer.findOne({
          $or: [{ email }, { facebookId }],
        });

        if (!user) {
          user = new Freelancer({
            email,
            facebookId,
            provider: "facebook",
            fname: profile.displayName,
            image: profile.photos?.[0]?.value,
            username:
              profile.displayName.toLowerCase().replace(/\s+/g, "_") +
              "_" +
              Date.now(),
            password: Math.random().toString(36).slice(-8),
          });
          await user.save();
        }
      } else if (role === "employer") {
        user = await Employer.findOne({
          $or: [{ contactEmail: email }, { facebookId }],
        });

        if (!user) {
          user = new Employer({
            contactEmail: email,
            facebookId,
            provider: "facebook",
            fname: profile.displayName,
            image: profile.photos?.[0]?.value,
            companyName: profile.displayName,
            password: Math.random().toString(36).slice(-8),
          });
          await user.save();
        }
      }

      return user;
    } catch (error) {
      console.error("Error in findOrCreateUser:", error);
      throw error;
    }
  }

  static async findUserById(id, role) {
    try {
      if (role === "freelancer") {
        return await Freelancer.findById(id);
      } else if (role === "employer") {
        return await Employer.findById(id);
      }
      throw new Error("Invalid role");
    } catch (error) {
      console.error("Error in findUserById:", error);
      throw error;
    }
  }

  static async generateToken(user, role) {
    try {
      const token = jwt.sign(
        {
          user_id: user._id,
          role: role,
          provider: "facebook",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      let userData;
      if (role === "freelancer") {
        userData = await Freelancer.findById(user._id);
      } else if (role === "employer") {
        userData = await Employer.findById(user._id);
      }

      return {
        access_token: token,
        user: {
          ...userData.toObject(),
          provider: "facebook",
        },
      };
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.provider !== "facebook") {
        throw new Error("Invalid provider");
      }

      let user;
      if (decoded.role === "freelancer") {
        user = await Freelancer.findById(decoded.user_id);
      } else if (decoded.role === "employer") {
        user = await Employer.findById(decoded.user_id);
      }

      if (!user) {
        throw new Error("User not found");
      }

      return {
        user,
      };
    } catch (error) {
      console.error("Error verifying token:", error);
      throw error;
    }
  }

  static async refreshToken(token) {
    try {
      const { user } = await this.verifyToken(token);
      return await this.generateToken(user, user.role);
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
}

module.exports = FacebookAuthServices;
