const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const multer = require('multer');
const nodemailer = require('nodemailer');
const OTP = require('../models/otp');
const randomstring = require('randomstring');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
});

const upload = multer({
  storage: storage
}).single('image');

const strongpassword = async(password) => {
  const hashpassword = await bcrypt.hash(password, 5);
  return hashpassword;
};

const sendVerifyMail = async(name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'For Verification Mail',
      html: `<p>Hii ${name}, Please click <a href="http://127.0.0.1:5000/verify?id=${user_id}">here</a> to verify your mail</p>`
    };
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email has been sent:-', info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadRegister = async(req, res) => {
  try {
    res.render('register');
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async(req, res) => {
  try {
    const spassword = await strongpassword(req.body.password);
    const newUser = new User({
      name: req.body.name,
      password: spassword,
      email: req.body.email,
      age: req.body.age,
      gender: req.body.gender,
      image: req.file.filename,
      is_verified: 0,
    });
    const userData = await newUser.save();

    if (userData) {
      sendVerifyMail(req.body.name, req.body.email, userData._id);
      res.render('register', { message: 'Registration done. Please verify your mail' });
    } else {
      res.render('register', { message: "Registration Failed" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const verifyMail = async(req, res) => {
  try {
    const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
    console.log(updateInfo);
    res.render('emailverified');
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async(req, res) => {
  try {
    res.render('login');
  } catch (error) {
    console.log(error.message);
  }
};

const generateOTP = async() => {
  try {
    return Math.floor(1000 + Math.random() * 9000).toString();
  } catch (error) {}
};

const sendMailOTP = async(email, user_id) => {
  try {
    const existingOTP = await OTP.findOne({ email: email });

    if (existingOTP) {
      await OTP.deleteOne({ email });
    }
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
    });

    const otp = await generateOTP();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'For Login',
      html: `<p>Hii, OTP for login: <b>${otp}</b>.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);

    const hashOTP = await bcrypt.hash(otp.toString(), 5);
    const newOtp = new OTP({
      email,
      otp: hashOTP,
    });

    const OTPdata = await newOtp.save();

    return { success: true, message: 'OTP has been sent to your email address.', otp: OTPdata.otp };
  } catch (error) {
    console.log('Error sending OTP email:', error.message);
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }
};

const verifylogin = async(req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_verified === 1) {
          const Otpsend = await sendMailOTP(userData.email, generateOTP());

          if (Otpsend.success) {
            res.redirect('/otpverified');
          } else {
            console.log("Unable to send otp");
            res.render('login', { message: 'Failed to send OTP. Please try again.' });
          }
        } else {
          res.render('login', { message: "Please Verify your mail" });
        }
      } else {
        res.render('login', { message: "Password is incorrect" });
      }
    } else {
      res.render('login', { message: "Email not found. Please create an account." });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadOtp = async(req, res) => {
  try {
    res.render('otpverified');
  } catch (error) {
    console.log(error.message);
  }
};

const verifyOTP = async(req, res) => {
  try {
    const email = req.body.email;
    const enteredOTP = req.body.otp;
    const userData = await User.findOne({ email: email });
    const storedOTP = await OTP.findOne({ email: email });

    if (storedOTP && userData) {
      const otpMatch = await bcrypt.compare(enteredOTP, storedOTP.otp);
      console.log(otpMatch);
      if (otpMatch) {
        req.session.user_id = userData._id;

        res.redirect('/home');
        return;
      } else {
        res.render('login', { message: 'Incorrect OTP. Please try again.' });
      }
    } else {
      res.render('login', { message: 'OTP not found. Please try again.' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadHome = async(req, res) => {
  try {
    const userData = await User.findById({ _id: req.session.user_id });
    res.render('home', { userData: userData });
  } catch (error) {
    console.log(error.message);
  }
};

const logOut= async(req, res) => {
  try {
    req.session.destroy();
    res.redirect('/');
  } catch (error) {
    console.log(error.message);
  }
};

const sendResetPassword = async(name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'For Reset Password',
      html: `<p>Hii ${name}, Please click <a href="http://127.0.0.1:5000/forget-password?token=${token}">here</a> to reset your password</p>`
    };
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email has been sent:-', info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadForget = async(req, res) => {
  try {
    res.render('forget');
  } catch (error) {
    console.log(error.message);
  }
};

const frogetVerified = async(req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
      const randomString = randomstring.generate();
      if (userData.is_verified === 0) {
        res.render('forget', { message: "Please verify your mail" });
      } else {
        userData.token = randomString;
        await userData.save();
        sendResetPassword(userData.name, userData.email, randomString);
        res.render('forget', { message: "Please check your mail to reset password" });
      }
    } else {
      res.render('forget', { message: "User not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const forgetPasswordload = async(req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });
    if (tokenData) {
      res.render('forget-password', { user_id: tokenData._id });
    } else {
      res.render('404', { message: "Page not found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async(req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;
    const securepassword = await strongpassword(password);
    const updateData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: securepassword, token: '' } });
    if (updateData) {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadRegister,
  loadLogin,
  insertUser,
  upload,
  verifyMail,
  verifylogin,
  loadOtp,
  verifyOTP,
  loadHome,
  logOut,
  loadForget,
  frogetVerified,
  forgetPasswordload,
  resetPassword
};

