import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ["organizer", "owner"],
        required: true
    },
    teamId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    }
},{
    timestamps: true
});

const User = mongoose.model("User", userSchema)

export default User;