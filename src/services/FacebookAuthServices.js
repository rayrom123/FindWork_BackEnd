const Freelancer = require("../models/Freelancer"); // Đảm bảo đường dẫn đúng
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/.env" });

class FacebookAuthServices {
  static async findOrCreateUser(profile) {
    try {
      const profileId = profile.id;
      const displayName = profile.displayName;
      const avatar = profile.photos?.[0]?.value || "";

      let user = await Freelancer.findOne({
        facebookId: profileId,
      });

      if (!user) {
        const timestamp = Date.now();
        const uniqueUsername = `${displayName}_${timestamp}`;
        user = await Freelancer.create({
          username: uniqueUsername,
          facebookId: profileId,
          avatar: avatar,
          fname: displayName,
          provider: "facebook",
        });
      }

      console.log("Created/Found freelancer:", {
        id: user._id,
        provider: user.provider,
      });

      return user;
    } catch (error) {
      console.error("Error in findOrCreateUser:", error);
      throw error;
    }
  }

  static async findUserById(id) {
    try {
      const user = await Freelancer.findById(id);
      return user;
    } catch (error) {
      console.error("Error in findUserById:", error);
      throw error;
    }
  }

  static async generateToken(user) {
    try {
      const token = jwt.sign(
        {
          user_id: user._id,
          provider: "facebook",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      const userData = await Freelancer.findById(user._id);

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

      const user = await Freelancer.findById(decoded.user_id);

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
      return await this.generateToken(user);
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
}

module.exports = FacebookAuthServices;
