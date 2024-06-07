const express = require('express');
const Routes = express();
const Controller = require('../controllers/Controller');
const hbs=require('hbs');
const session = require('express-session');
const config=require('../config/config');
const auth=require('../middleware/auth');


Routes.use(session({
    secret: config.sessionSecrte,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 7*4*60*60*1000}
}));
Routes.use(express.urlencoded({ extended: false }));
Routes.use(express.static('public'));
Routes.use(express.static('uploads'));
Routes.set('view engine', 'hbs');

Routes.use(express.json());





Routes.get('/register',auth.isLogout, Controller.loadRegister);
Routes.post('/register',Controller.upload, Controller.insertUser);
Routes.get('/verify', Controller.verifyMail);
Routes.get('/', auth.isLogout,Controller.loadLogin);
Routes.get('/login',auth.isLogin, Controller.loadLogin);
Routes.post('/login', Controller.verifylogin);
Routes.get('/otpverfied',Controller.loadOtp);
Routes.post('/otpverfied',Controller.verifyOTP);
Routes.get('/home',auth.isLogin,Controller.loadHome);
Routes.get('/logout',auth.isLogin,Controller.logOut)
Routes.get('/forget',auth.isLogout,Controller.loadForget)
Routes.post('/forget',auth.isLogout,Controller.frogetVerified)
Routes.get('/forget-password',auth.isLogout,Controller.forgetPasswordload)
Routes.post('/forget-password',auth.isLogout,Controller.resetPassword);
module.exports = Routes