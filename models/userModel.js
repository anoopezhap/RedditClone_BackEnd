const catchAsync = require('../utils/catchAsync')
const AppError = require('./../utils/appError')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')




module.exports = (sequelize,DataTypes)=>
{
    const User = sequelize.define('user',{
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true
        },
        userName :{
            type: DataTypes.STRING,
            allowNull:false,
            unique:{
                msg:'User Name already exists'
            },
            validate:{
                notEmpty :{
                    msg:'Please enter a userName'
                }
            }
              
        },
        image:{
            type:DataTypes.STRING
        },
        email:{
            type: DataTypes.STRING,
            allowNull:false,
            validate:{
                isEmail:{
                    msg:'Please enter a valid email'
                },
                notEmpty:{
                    msg:'Please enter a email id'
                }
            },
            unique : {
                msg:'User with email ID already exists'
            },
            set(value)
            {
                if(!value)
                {
                    throw new AppError('Please enter email id',400)
                }
                this.setDataValue('email',value.toLowerCase())
            }
        },
        password:{
            type:DataTypes.STRING,
            allowNull:false
        },
        confirmPassword:{   
            type:DataTypes.STRING,
            allowNull:false,
            validate: {
               
                isSame(value){
                    if(this.password != value)
                    {
                        throw new AppError('Password and confirm password should be same',400)
                    }
                }
            },

        },
        role:{
            type:DataTypes.STRING,
            defaultValue:'user',
            validate:{
                isIn:{
                    args:[['user','admin']],
                    message:'Role should be user or admin'
                }
            }

        },
        passwordChangedAt: {
            type:DataTypes.DATE
        },
        passwordResetToken:DataTypes.STRING,
        passwordResetExpires:DataTypes.DATE 
    },
        {
            timestamps:false
        })
    

    //this hook only runs 

    User.beforeSave(async function(user){
        const hashedPassword = await bcrypt.hash(user.password,10)
        user.password = hashedPassword;
    })

    //this hook only works only after build and validators are run ie before save

    User.beforeSave(user=>{
        user.confirmPassword = ""
    })

    //instance method to compared hashed password in db with user entered password

    User.prototype.comparePassword = async function (enteredPassword){
        return  bcrypt.compare(enteredPassword,this.password)

        //return true is password is correct
    }

    //instance method to check if password was changed after issuing token

    User.prototype.compareDates =  function(tokenIssuedAt){
        
        if(this.passwordChangedAt)
        {
            //console.log({tokenIssuedAt},this.passwordChangedAt)
            return tokenIssuedAt <this.passwordChangedAt

            //returns true is password was changed after issuing token
        }

        return false
    }

    //create password reset token
    
    User.prototype.createPasswordResetToken = function()
    {
        const resetToken = crypto.randomBytes(32).toString('hex')
        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        this.passwordResetExpires = Date.now() + 10*60*1000

        //console.log(`passwordresetexpires ${this.passwordResetExpires}`)

        return resetToken;
    }






    return User
}