const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();
const RegisterFreelancer = (FreelancerData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newFreelancer = new Freelancer(FreelancerData);
      //Hash password
      const hashPassword = await bcrypt.hash(
        FreelancerData.password,
        saltRounds,
      );
      FreelancerData.password = hashPassword;
      //

      const savedData = await newFreelancer.save();
      console.log("Saved data:", savedData);

      resolve(newFreelancer);
    } catch (e) {
      console.log("fail1");
      reject(e);
    }
  });
};

const RegisterEmployer = (EmployerData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newEmployer = new Employer(EmployerData);
      console.log("employer pass", EmployerData);
      //Hash password
      const hashPassword = await bcrypt.hash(EmployerData.password, saltRounds);
      EmployerData.password = hashPassword;
      //
      const savedData = await newEmployer.save();
      console.log("Saved data:", savedData);

      resolve(newEmployer); // Resovle only with Employer
    } catch (e) {
      console.error("Error:", e);
      reject(e);
    }
  });
};

const checkLogin = async (username, password) => {
  try {
    // Find by username or email
    let user = await Freelancer.findOne({ username });
    if (!user) {
      const companyName = username;
      user = await Employer.findOne({ companyName });
      if (!user) {
        throw new Error("Invalid username ");
      } else {
        if (password !== user.password) {
          throw new Error("Invalid password");
        }
      }
    } else if (user) {
      console.log("123");
      if (password !== user.password) {
        throw new Error("Invalid username or password");
      }
    }
    const payload = {
      username_jwt: username,
    };
    const access_token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    console.log(access_token);
    return {
      access_token,
      user: {
        username: username,
        userid: user._id,
      },
    };
  } catch (e) {
    throw e;
  }
};

module.exports = {
  RegisterEmployer,
  RegisterFreelancer,
  checkLogin,
};
