const catchAsync = require("./../utils/catchAsync");
const {
  models: { Thread },
  sequelize,
} = require("./../models/index");
const {
  models: { User },
} = require("./../models/index");
const {
  models: { Comment },
} = require("./../models/index");
const {
  models: { Like },
} = require("./../models/index");

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

const { Op } = require("sequelize");
const AppError = require("../utils/appError");

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

exports.uplaodThreadPhoto = upload.single("photo");

exports.createThread = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;
  const userId = req.user.id;
  //const imageName = req.file.filename

  if (!title || !description) {
    return next(
      new AppError("A thread should have a title and description", 400)
    );
  }

  const thread = await Thread.create({ title, description, userId });

  res.status(200).json({
    status: "Success",
    data: thread,
  });
});

exports.getAllThreads = catchAsync(async (req, res, next) => {
  const thread = await Thread.findAll({
    include: [
      {
        model: User,
        attributes: ["userName"],
      },
      {
        model: Comment,
        attributes: ["comment"],
        include: {
          model: User,
          attributes: ["userName"],
        },
      },
      {
        model: Like,
        attributes: ["id"],
      },
    ],
    attributes: ["id", "title", "description"],
  });

  res.status(200).json({
    status: "Success",
    count: thread.length,
    data: thread,
  });
});

exports.editThread = catchAsync(async (req, res, next) => {
  const threadId = req.params.threadId;
  const userId = req.user.id;

  // console.log("threadid", threadId);
  // console.log("userid", userId);

  //verify is the thread exists with this thread it and if the thread belong
  //to the loggedin user
  const thread = await Thread.findAll({
    where: {
      [Op.and]: [{ id: threadId }, { userId }],
    },
  });

  if (thread.length === 0) {
    return next(
      new AppError(
        "The thread doesnt exist or this thread belongs to a differnt user"
      )
    );
  }

  const filteredBody = filterObj(req.body, "title", "description");

  const updatedthread = await Thread.update(filteredBody, {
    where: {
      id: threadId,
    },
  });

  res.status(200).json({
    status: "successfully updated",
  });
});

exports.getThreadWithId = catchAsync(async (req, res, next) => {
  const threadId = req.params.threadId;

  const thread = await Thread.findOne({
    where: { id: threadId },
    attributes: ["id", "title", "description", "image"],
    include: [
      {
        model: User,
        attributes: ["userName"],
      },
      {
        model: Comment,
        attributes: ["comment"],
        include: {
          model: User,
          attributes: ["userName"],
        },
      },
      {
        model: Like,
        attributes: ["id"],
      },
    ],
  });

  if (!thread) {
    return next(new AppError("The thread doent exists", 400));
  }

  res.status(200).json({
    status: "success",
    data: thread,
  });
});

exports.deleteThread = catchAsync(async (req, res, next) => {
  const threadId = req.params.threadId;

  await Thread.destroy({
    where: { id: threadId },
  });

  res.status(400).json({
    status: "Successfully deleted",
  });
});
