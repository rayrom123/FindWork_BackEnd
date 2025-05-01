const Employer = require("../models/Employer");
const Freelancer = require("../models/Freelancer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: "./src/.env" });

class GoogleAuthServices {
  static async findOrCreateUser(profile, role) {
    try {
      const profileId = profile.id;
      const email = profile.emails[0].value;
      const displayName = profile.displayName;
      const avatar = profile.photos?.[0]?.value || "";

      let user;
      if (role === "employer") {
        // Tìm employer theo providerId hoặc email
        user = await Employer.findOne({
          $or: [
            { providerId: profileId, provider: "google" },
            { email: email },
          ],
        });

        if (!user) {
          // Tạo companyName duy nhất bằng cách thêm timestamp
          const timestamp = Date.now();
          const uniqueCompanyName = `${displayName}_${timestamp}`;

          // Tạo employer mới nếu chưa tồn tại
          user = await Employer.create({
            companyName: uniqueCompanyName,
            email: email,
            contactEmail: email, // Sử dụng email từ Google làm contactEmail
            provider: "google",
            providerId: profileId,
            avatar: avatar,
            fname: displayName,
          });
        } else if (!user.providerId) {
          // Nếu user tồn tại nhưng chưa có providerId, cập nhật
          user.providerId = profileId;
          user.provider = "google";
          if (!user.contactEmail) {
            user.contactEmail = email;
          }
          await user.save();
        }
      } else {
        // Tìm freelancer theo providerId hoặc email
        user = await Freelancer.findOne({
          $or: [
            { providerId: profileId, provider: "google" },
            { email: email },
          ],
        });

        if (!user) {
          // Tạo username duy nhất bằng cách thêm timestamp
          const timestamp = Date.now();
          const uniqueUsername = `${displayName}_${timestamp}`;

          // Tạo freelancer mới nếu chưa tồn tại
          user = await Freelancer.create({
            username: uniqueUsername,
            email: email,
            provider: "google",
            providerId: profileId,
            avatar: avatar,
            fname: displayName,
          });
        } else if (!user.providerId) {
          // Nếu user tồn tại nhưng chưa có providerId, cập nhật
          user.providerId = profileId;
          user.provider = "google";
          await user.save();
        }
      }

      console.log("Created/Found user:", {
        id: user._id,
        role: role,
        email: user.email,
        provider: user.provider,
      });

      return user;
    } catch (error) {
      console.error("Error in findOrCreateUser:", error);
      throw error;
    }
  }

  static async findUserById(id, role) {
    try {
      let user;
      if (role === "employer") {
        user = await Employer.findById(id);
      } else {
        user = await Freelancer.findById(id);
      }
      return user;
    } catch (error) {
      console.error("Error in findUserById:", error);
      throw error;
    }
  }

  static async generateToken(user, role) {
    try {
      // Tạo token JWT
      const token = jwt.sign(
        {
          user_id: user._id,
          role: role,
          provider: "google",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      // Lấy thông tin user đầy đủ
      let userData;
      if (role === "employer") {
        userData = await Employer.findById(user._id);
      } else {
        userData = await Freelancer.findById(user._id);
      }

      // Trả về object đầy đủ
      return {
        access_token: token,
        user: {
          ...userData.toObject(),
          role: role,
          provider: "google",
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

      if (decoded.provider !== "google") {
        throw new Error("Invalid provider");
      }

      let user;
      if (decoded.role === "employer") {
        user = await Employer.findById(decoded.user_id);
      } else if (decoded.role === "freelancer") {
        user = await Freelancer.findById(decoded.user_id);
      }

      if (!user) {
        throw new Error("User not found");
      }

      return {
        user,
        role: decoded.role,
      };
    } catch (error) {
      console.error("Error verifying token:", error);
      throw error;
    }
  }

  static async refreshToken(token) {
    try {
      const { user, role } = await this.verifyToken(token);
      return await this.generateToken(user, role);
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
}

module.exports = GoogleAuthServices;
