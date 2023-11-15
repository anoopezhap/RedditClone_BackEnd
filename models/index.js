const Sequelize = require("sequelize");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

//creating an instance of seqquelize and connecting to db

const sequelize = new Sequelize(
  "reddit",
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    logging: false,
  }
);

//verifying db connection

const checkForDBConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connection is succesfull");
  } catch (err) {
    console.log(err);
    console.log("db connection failed");
  }
};

checkForDBConnection();

const db = {};
db.sequelize = sequelize;
db.models = {};

db.models.User = require("./userModel")(sequelize, Sequelize.DataTypes);
db.models.Thread = require("./threadModel")(sequelize, Sequelize.DataTypes);
db.models.Comment = require("./../models/commentModel")(
  sequelize,
  Sequelize.DataTypes
);
db.models.Like = require("./../models/likeModel")(
  sequelize,
  Sequelize.DataTypes
);

//btwn user and thread
db.models.User.hasMany(db.models.Thread);
db.models.Thread.belongsTo(db.models.User);

//btwn thread and comment
db.models.Thread.hasMany(db.models.Comment);
db.models.Comment.belongsTo(db.models.Thread);

//btwn user and comment
db.models.User.hasMany(db.models.Comment);
db.models.Comment.belongsTo(db.models.User);

//btwn user and like
db.models.User.hasMany(db.models.Like);
db.models.Like.belongsTo(db.models.User);

//btwn thread and like
db.models.Thread.hasMany(db.models.Like);
db.models.Like.belongsTo(db.models.Thread);

module.exports = db;
