


module.exports = (sequelize,DataTypes)=>
{
    const Comment = sequelize.define('comment',{
        id:{
            type:DataTypes.UUID,
            defaultValue:DataTypes.UUIDV4,
            primaryKey:true
        },
        comment:{
            type:DataTypes.STRING,
            allowNull:false,
            validate :{
                notEmpty:{
                    msg:'Please enter a comment'
                }
            }
        }
    })




    return Comment
}