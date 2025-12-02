const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

// IMPORTANT: Ensure these match your actual model filenames
const User = require("../models/User"); 
const Employee = require("../models/employees");
const Company = require("../models/company"); 

// Use environment variables for security
const EMAIL_USER = process.env.EMAIL_USER || "electroland2005@gmail.com"; 
const EMAIL_PASS = process.env.EMAIL_PASS || "your_16_char_app_password"; // <--- PASTE APP PASSWORD HERE

// In-memory OTP storage
const otpStorage = new Map();

exports.sendOtp = async (req, res) => {
  try {
    const { identifier, type } = req.body;
    console.log(`[SendOTP] Request: Identifier=${identifier}, Type=${type}`);

    if (!identifier || !type) {
      return res.status(400).json({ success: false, message: "Identifier and type are required." });
    }

    let userEmail = null;

    // --- LOGIC 1: LOOKUP BY USER ID ---
    if (type === "user_id") {
      // 1. Find the User using 'userId' (Matches your Schema)
      const user = await User.findOne({ userId: identifier });

      if (user) {
        console.log(`[SendOTP] User found: ${user._id}`);
        
        // 2. Resolve Email via Employee or Company
        if (user.emp_id) {
            const employee = await Employee.findOne({ e_id: user.emp_id });
            if (employee) userEmail = employee.email;
        } 
        else if (user.c_id) {
            // Support for Company users based on your schema's c_id
            const company = await Company.findOne({ c_id: user.c_id }); 
            if (company) userEmail = company.email;
        }
      } else {
          console.log(`[SendOTP] User with userId '${identifier}' not found.`);
      }
    } 
    // --- LOGIC 2: LOOKUP BY EMAIL ---
    else if (type === "email") {
      // Check Employee table
      const employee = await Employee.findOne({ email: identifier });
      if (employee) {
          userEmail = employee.email;
      } else {
          // Check Company table
          const company = await Company.findOne({ email: identifier });
          if (company) userEmail = company.email;
      }
    }

    if (!userEmail) {
      console.log("[SendOTP] Email address could not be resolved.");
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    // Generate & Store OTP
    const otp = otpGenerator.generate(6, { digits: true, lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
    
    // Store OTP against the resolved EMAIL
    otpStorage.set(userEmail, { otp, timestamp: Date.now() });
    
    // Cleanup after 10 mins
    setTimeout(() => { if(otpStorage.has(userEmail)) otpStorage.delete(userEmail); }, 10 * 60 * 1000);

    // Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"ElectroWorld" <${EMAIL_USER}>`,
      to: userEmail,
      subject: "Password Reset OTP",
      html: `<h3>Your OTP is: ${otp}</h3><p>Valid for 10 minutes.</p>`,
    });

    console.log(`[SendOTP] OTP sent to ${userEmail}`);
    res.json({ success: true, message: "OTP sent successfully!" }); 
  } catch (error) {
    console.error("[SendOTP] Error:", error);
    res.status(500).json({ success: false, message: "Server error sending OTP." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword, identifier, type } = req.body;
    console.log(`[ResetPassword] Request: Identifier=${identifier}, OTP=${otp}`);

    if (!otp || !newPassword || !confirmPassword || !identifier) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    let userEmail = null;
    let userRecord = null;
    
    // --- RESOLVE USER & EMAIL AGAIN ---
    // We need to find the user to update AND the email to verify the OTP.
    
    if (type === 'user_id') {
        // 1. Find User by userId
        userRecord = await User.findOne({ userId: identifier }); // Matches Schema

        if (userRecord) {
             // 2. Get Email from linked profile
             if (userRecord.emp_id) {
                 const emp = await Employee.findOne({ e_id: userRecord.emp_id });
                 if (emp) userEmail = emp.email;
             } 
             else if (userRecord.c_id) {
                 const comp = await Company.findOne({ c_id: userRecord.c_id });
                 if (comp) userEmail = comp.email;
             }
        }
    } else {
        // Identifier IS the email
        userEmail = identifier;
        
        // Find the User record associated with this email
        const emp = await Employee.findOne({ email: identifier });
        if (emp) {
            userRecord = await User.findOne({ emp_id: emp.e_id });
        } else {
            const comp = await Company.findOne({ email: identifier });
            if (comp) {
                userRecord = await User.findOne({ c_id: comp.c_id });
            }
        }
    }

    if (!userEmail || !userRecord) {
        console.log("[ResetPassword] User or linked email not found.");
        return res.status(404).json({ success: false, message: "User account not found." });
    }

    // --- VERIFY OTP ---
    const storedData = otpStorage.get(userEmail);
    
    if (!storedData) {
        console.log(`[ResetPassword] No OTP found for ${userEmail} (Expired?)`);
        return res.status(400).json({ success: false, message: "OTP expired or invalid." });
    }

    if (storedData.otp !== otp) {
        console.log(`[ResetPassword] Mismatch. Expected ${storedData.otp}, Got ${otp}`);
        return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // --- UPDATE PASSWORD ---
    // Note: Ensure you hash the password if you are using bcrypt elsewhere!
    userRecord.password = newPassword; 
    await userRecord.save();

    console.log(`[ResetPassword] Success for User: ${userRecord.userId}`);
    otpStorage.delete(userEmail);

    res.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("[ResetPassword] Error:", error);
    res.status(500).json({ success: false, message: "Server error resetting password." });
  }
};