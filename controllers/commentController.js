const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const {models : {Comment}} = require('./../models/index')
const {models : {Thread}} = require('./../models/index')
const {models : {User}} = require('./../models/index')
//const filterObj = require('./../utils/filterObj')

const {Op} = require('sequelize')

const filterObj = (obj,...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el))
        {
        newObj[el] = obj[el]
        }
    })
    return newObj;
}

exports.addComment = catchAsync(async(req,res,next)=>{

    const threadId = req.params.threadId
    const comment = req.body.comment
    const userId = req.user.id

    if(!threadId)
    {
        return next(new AppError('Please select a  thread'))
    }

    if(!comment)
    {
        return next(new AppError('Please enter a comment',400))
    }

    const doc = await Comment.create({threadId,comment,userId})

    res.status(200).json({
        status:'Success',
        data:doc
    })
})

exports.editComment = catchAsync(async(req,res,next)=>
{
    const commentId = req.params.commentId
    const userId = req.user.id



    const comment = await Comment.findAll({
        where:{
            [Op.and]:[{id:commentId},{userId}]
        }
    })



    if(comment.length === 0)
    {
        return next(new AppError('The comment doesnt exists or doesnt belongs to you'))
    }

    const filteredBody = filterObj(req.body,'comment')

    await Comment.update(filteredBody,{
        where:{
            id:commentId
        }
    })

    res.status(200).json({
        status:'success'
    })


})


exports.getCommentOfAThread = catchAsync(async(req,res,next)=>{

    const threadId = req.params.threadId;

    const thread = await Thread.findOne({where:{id:threadId},
        attributes:['title','description'],
    include:{
        model:Comment,
        attributes:['comment'],
        include:{
            model:User,
            attributes:['userName']
        }
            },
        })

        if(!thread)
        {
            return next(new AppError('The thread doesnt exist',400))
        }

    res.status(200).json({
        status:'success',
        thread: thread
    })
})