import express from "express";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
	const { email, fullName, password } = req.body;
	try {
		if (!email || !fullName || !password) {
			return res.status(400).json({ message: "All fields are required" });
		}
		if (password.length < 6) {
			return res
				.status(400)
				.json({
					message: "Password should be atleast 6 characters long",
				});
		}

		const user = await User.findOne({ email });
		if (user) {
			return res.status(400).json({ message: "Email already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = new User({
			email,
			fullName,
			password: hashedPassword,
		});

		if (newUser) {
			generateToken(newUser._id, res);
			await newUser.save();
			res.status(201).json({
				_id: newUser._id,
				email: newUser.email,
				fullName: newUser.fullName,
				profilePicture: newUser.profilePicture,
			});
		} else {
			res.status(400).json({ message: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error", error.message);
		res.status(500).json({ message: "Interval Server Error" });
	}
};
export const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ message: "All fields are required" });
	}

	try {
		const user = await User.findOne({ email });
		console.log("User found:", user);
		if (!user) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(400).json({ message: "Invalid credentials" });
		}
		generateToken(user._id, res);

		res.status(200).json({
			_id: user._id,
			email: user.email,
			fullName: user.fullName,
			profilePicture: user.profilePicture,
		});
	} catch (error) {
		console.log("Error in Log in Controller", error.message);
		res.status(500).json({ message: "Interval Server Error" });
	}
};
export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged Out Succesfully" });
	} catch (error) {
		console.log("Error in Log out Controller", error.message);
		res.status(500).json({ message: "Interval Server Error" });
	}
};
export const updatepfp = async (req, res) => {
	try {
		const { profilePic } = req.body;
		const userId = req.user._id;
	
		if (!profilePic) {
		  return res.status(400).json({ message: "Profile pic is required" });
		}
		// console.log("Profile pic received:");
		const uploadResponse = await cloudinary.uploader.upload(profilePic);
		console.log("Upload response:", uploadResponse);
		const updatedUser = await User.findByIdAndUpdate(
			userId,
			{ profilePicture: uploadResponse.secure_url },
			{ new: true }
		);
		console.log("Updated user:", updatedUser);
		res.status(200).json(updatedUser);
	  } catch (error) {
		console.log("error in update profile:", error);
		res.status(500).json({ message: "Internal server error" });
	  }
};
export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in Check Auth Controller", error.message);
        res.status(500).json({ message: "Interval Server Error" });
    }
};
