const { Sequelize } = require("sequelize");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const {
  models: { Thread },
} = require("./../models/index");
const {
  models: { Comment },
} = require("./../models/index");
const {
  models: { User },
} = require("./../models/index");
const {
  models: { Like },
} = require("./../models/index");
const { sequelize } = require("./../models/index");

const multer = require("multer");

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/user");
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split("/")[1];
    cb(null, `user-${req.user.userName}-${Date.now()}.${extension}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload a valid image", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.uploadUserPhoto = upload.single("photo");

exports.getAllMyThreads = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const thread = await Thread.findAll({
    include: [
      {
        model: User,
        where: {
          id: userId,
        },
        attributes: [],
      },
      {
        model: Like,
        attributes: ["id"], //,[sequelize.fn('COUNT', sequelize.col('likes.id')), 'n_hats']],
      },
    ],
    // ,attributes:['id','title','description','image'],
  });

  res.status(200).json({
    status: "success",
    count: thread.length,
    data: thread,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (!req.file) {
    next(new AppError("Please select an image", 400));
  }

  const userId = req.user.id;

  const user = await User.findOne({ where: { id: userId } });

  await user.update({ image: req.file.filename });

  res.status(200).json({
    status: "succes",
  });
});
