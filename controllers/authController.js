const catchAsync = require("./../utils/catchAsync");
const {
  models: { User },
} = require("./../models/index");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const crypto = require("crypto");

const createToken = (id) => {
  return (token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  }));
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });

  const token = createToken(newUser.id);

  res.status(200).json({
    status: "User Created",
    token: token,
    data: newUser,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1)Check if email and password exists

  if (!email || !password) {
    return next(new AppError("please provide email and password", 400));
  }

  //2)check if user exists in the db  and password is correct

  const user = await User.findOne({ where: { email: email } });

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email id or password", 400));
  }

  //3) If everything good until now, send JWT back to client

  const token = createToken(user.id);

  res.status(200).json({
    status: "Success",
    token: token,
    user: user.userName,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1)Check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not logged in, please login to procees"));
  }

  //2)validate token

  const decodedSignature = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  const loggedInUser = await User.findOne({
    where: { id: decodedSignature.id },
  });

  //3)check if user exists

  if (!loggedInUser) {
    return next(new AppError("The user belonging to this email doesnt exists"));
  }

  //4)check if user changed password after the token was issued

  //const passWordChangedAt = loggedInUser.passWordChangedAt
  const tokenIssuedAt = new Date(parseInt(decodedSignature.iat) * 1000);

  //console.log({tokenIssuedAt})

  if (loggedInUser.compareDates(tokenIssuedAt)) {
    return next(
      new AppError("User recently changed password,please login again", 400)
    );
  }

  // if(passWordChangedAt<tokenIssuedAt || !passWordChangedAt)
  // {
  //     return next(new AppError('User recently changed password,please login again'))
  // }

  req.user = loggedInUser;

  // console.log('protect passed')

  // res.status(200).json({
  //     message:"you are logged in"
  // })

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("The user dont have access to this function", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get user based on provided email

  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(new AppError("There is no user with the provided email"));
  }

  //2)Generate random reset token link

  const resetToken = user.createPasswordResetToken(user);

  await user.save();

  //send reset token

  res.status(200).json({
    status: "here is the password reset link",
    token: { resetToken },
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  console.log(req.params.token);
  //created hased token using reset token

  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //get user based on the hashed token

  const user = await User.findOne({
    where: { passwordResetToken: hashedToken },
  });

  if (!user || user.passwordResetExpires < Date.now()) {
    return next(new AppError("Token is expired or user doesnt exists", 400));
  }

  //update required fields

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.passwordChangedAt = Date.now() - 1000;

  console.log(`user.passwordchanged at ${user.passwordChangedAt}`);

  await user.validate();

  await user.save({ validate: false });

  const token = createToken(user.id);

  res.status(200).json({
    status: "User password updated",
    token: token,
    data: user,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1)get user from the DB. The step happens after project middleware

  const user = await User.findOne({ where: { id: req.user.id } });

  //console.log(user.toJSON()) -->able to get the user

  //2)check is entered current password is correct

  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(
      new AppError("The entered current password is not correct", 400)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordChangedAt = Date.now() - 1000;
  await user.validate();

  await user.save({ validate: false });

  const token = createToken(user.id);

  res.status(200).json({
    status: "User password updated",
    token: token,
    data: user,
  });
});
