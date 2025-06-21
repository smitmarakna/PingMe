import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }); // all users except the logged in user
        res.status(200).json(users);
        // console.log(users);
        
    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params; // id of the user to chat with
        const myId = req.user._id; // id of the logged in user

        const messages = await Message.find({
            $or: [
                { senderId:myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages Controller: ", error.message);
        res.status(500).json({ message: error.message });               
    }
}

export const sendMessage = async (req, res) => {
    try {
        const myId = req.user._id; // id of the logged in user
        const { id: userToChatId } = req.params; // id of the user to chat with
        const { text, Image } = req.body;

        let imageUrl;
        if (Image) {
            // upload image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(Image);
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = new Message({
            text,
            senderId: myId,
            receiverId: userToChatId,
            Image: imageUrl,
        });

        await newMessage.save();

        // TODO: REAL TIME FUNCTIONALITY - SOCKET.IO

        res.status(200).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage Controller: ", error.message);
        res.status(500).json({ message: error.message });           
    }
}