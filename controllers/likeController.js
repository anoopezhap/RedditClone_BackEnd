const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const {models:{Thread}} = require('./../models/index')
const {models:{Comment}} = require('./../models/index')
const {models:{User}} = require('./../models/index')
const {models:{Like}} = require('./../models/index')



exports.addLike = catchAsync(async(req,res,next)=>{

    const threadId = req.params.threadId
    const userId = req.user.id

    

    console.log({threadId},{userId})

    await Like.create({threadId,userId})

    res.status(200).json({
        status:'success'
    })
})