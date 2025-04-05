const Freelancer = require("../models/Freelancer");
const Employer = require("../models/Employer");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const RegisterFreelancer = (FreelancerData) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newFreelancer = new Freelancer(FreelancerData);
      await newFreelancer.save();

      const savedData = await newFreelancer.save();
      console.log("Saved data:", savedData);

      console.log("sucess");

      resolve("Created:", newFreelancer);
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
      await newEmployer.save();

      const savedData = await newEmployer.save();
      console.log("Saved data:", savedData);

      resolve("Created:", newEmployer);
    } catch (e) {
      console.log("f3");
      reject(e);
    }
  });
};


const LoginEmployer = async (email, password) => {
  try {
    
    const user = await Employer.findOne({ contactEmail: email })
    console.log(user);
      if (!user) {
        throw new Error("Invalid email ");
      } else {
        console.log(user.companyPassword)
        if (password !== user.companyPassword) {
          throw new Error("Invalid password");
        }
      }
    return user.toObject();
  } catch (e) {
    throw e;
  }
};

const LoginFreelancer = async (email, password) => {
  try {
    const user = await Freelancer.findOne({ email: email });
      if (!user) {
        throw new Error("Invalid email ");
      } else {
        if (password !== user.password) {
          throw new Error("Invalid password");
        }
      }
    return user.toObject();
  } catch (e) {
    throw e;
  }
};

module.exports = {
  RegisterEmployer,
  RegisterFreelancer,
  LoginEmployer,
  LoginFreelancer
  
};
