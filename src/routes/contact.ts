import { Express } from "express-serve-static-core";
import passport from "passport";
import { User } from "../entity/User";
import dotenv from "dotenv";

// Configuration for /mobile-signup-send-otp

dotenv.config();

const jwt = require("jsonwebtoken");
const secret = process.env.SESSION_SECRET || "keyboard cat";
const expiresIn = "60s";

export function mobileOtpAuth(app: Express) {
  app.post("/mobile-signup-send-otp", verifyRecaptchaEnterpriseToken, async function (req, res, next) {
    //TODO: Restrict OTP calls to x per hour or minute
    // get name and mobile from request body
    const { name, mobileNumber, email, referralCode, meta } = req.body;
    if (!name) {
      res.status(400).send({ message: "Invalid name." });
      return;
    }
    // check mobile number must start with +91
    // TODO: add more validation for phone number
    if (!mobileNumber || !mobileNumber.trim().startsWith("+91")) {
      res.status(400).send({ message: "Invalid mobile number." });
      return;
    }
    // check if this user already exists
    const existing_user = await User.findOne({
      where: {
        phone_number: mobileNumber
      }
    });

    // check if email already exists with another user and verified also
    const existingUserWithSameEmail = await User.findOne({
      where: {
        email: email,
        emailVerified: true
      }
    });
    if (existing_user || existingUserWithSameEmail) {
      res.status(400).send({
        message: "User already exists with this phone number or email, please sign in to continue.",
        isEmailExists: !!existingUserWithSameEmail,
        isPhoneExists: !!existing_user
      });
      return;
    }
    if (referralCode) {
      const doRefereeExists = await Profile.findOne({
        where: {
          referral_code: referralCode
        }
      });
      if (!doRefereeExists) {
        res.status(400).send({
          message: `Referral code is invalid.`
        });
      }
    }
    try {
      // create otp record
      const savedOtpRecord = await createOTPRecord({
        phone_number: mobileNumber,
        name: name,
        email: email,
        referral_code: referralCode,
        meta: meta || {}
      });
      // send otp to mobile number
      const sessionId = await sendOtpToMobile2Factor(mobileNumber, savedOtpRecord.otp);
      await Otp.update(savedOtpRecord.id, { mobile_otp_session_id: sessionId });
      res.send({ message: `OTP sent`, mobileNumber });
    } catch (err) {
      res.status(500).send({ message: "Something went wrong while generating otp!" });
    }
  });
}
