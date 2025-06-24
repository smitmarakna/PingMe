import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5003/" : "/";  // Adjust this based on your backend URL

export const useAuthStore = create((set, get) => ({
	authUser: null,
	isSigningUp: false,
	isLoggingIn: false,
	isUpdatingProfile: false,
	isCheckingAuth: true,
	onlineUsers: [],
	socket: null,

	checkAuth: async () => {
		try {
			const response = await axiosInstance.get("/auth/check");
			set({ authUser: response.data });
			get().connectToSocket(); // Connect to socket after checking auth
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
			get().connectToSocket(); 
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
			get().dissconnectFromSocket(); // Disconnect from socket on logout
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

			get().connectToSocket();
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

	connectToSocket: () => { 
		const { authUser } = get();
		if (!authUser || get().socket?.connected) return;
		
		const socket = io(BASE_URL, {
			query: {
				userId: authUser._id,
			}, 
		});
		socket.connect();
		set({ socket: socket });
		
		socket.on("getOnlineUsers", (userIds) => {
			set({ onlineUsers: userIds });
		});

	},
	
	dissconnectFromSocket: () => { 
		if (get().socket?.connected) get().socket.disconnect();
		
	}
}));
