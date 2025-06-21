import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000/api" : "/";

export const useAuthStore = create((set) => ({
	authUser: null,
	isSigningUp: false,
	isLoggingIn: false,
	isUpdatingProfile: false,
	isCheckingAuth: true,
	onlineUsers: [],

	checkAuth: async () => {
		try {
			const response = await axiosInstance.get("/auth/check");
			set({ authUser: response.data });
		} catch (error) {
			console.error("Error in CheckAuth", error);
			set({ authUser: null });
		} finally {
			set({ isCheckingAuth: false });
		}
	},

	signUp: async (formData) => {
		set({ isSigningUp: true });
		try {
			const response = await axiosInstance.post("/auth/signup", formData);
			set({ authUser: response.data });
			toast.success("Signed up successfully");
		} catch (error) {
			toast.error(error.response.data.message);
		} finally {
			set({ isSigningUp: false });
		}
	},

	logout: async () => {
		try {
			await axiosInstance.post("/auth/logout");
			set({ authUser: null });
			toast.success("Logged out successfully");
		} catch (error) {
			console.error("Error in Logout", error);
		}
	},

	login: async (formData) => {
		set({ isLoggingIn: true });
		try {
			const response = await axiosInstance.post("/auth/login", formData);
			set({ authUser: response.data });
			toast.success("Logged in successfully");
		} catch (error) {
			toast.error(error.response.data.message);
		} finally {
			set({ isLoggingIn: false });
		}
	},

	updateProfile: async (data) => {
		set({ isUpdatingProfile: true });
		try {
			const res = await axiosInstance.put("/auth/update-pfp", data);
			console.log("Profile updated:", res.data);
			set({ authUser: res.data });
			toast.success("Profile updated successfully");
		} catch (error) {
			console.log("error in update profile:", error);
			toast.error(error.response.data.message);
		} finally {
			set({ isUpdatingProfile: false });
		}
	},
}));
