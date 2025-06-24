import e from "express";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    Image: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);