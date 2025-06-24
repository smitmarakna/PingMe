import { create } from "zustand";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore"; // Assuming you have an auth store to get the socket

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    isUsersLoading: false,
    isMessagesLoading: false,
    selectedUser: null,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
            set({ isUsersLoading: false });
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });

        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data });
        } catch (error) {
            console.error("Error fetching messages:", error);
            toast.error("Failed to load messages");
        } finally {
            set({ isMessagesLoading: false });
        }
    },   

    sendMessage: async (msg) => {
        const { selectedUser, messages } = get();
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, msg);
            set({ messages: [...messages, response.data] });
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    },

    subscribeToMessages: () => { 
        const { selectedUser,  } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => { 
            const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
            if (!isMessageFromSelectedUser) return;
            set({
                messages: [...get().messages, newMessage],
            })
         })
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (user) => set({ selectedUser: user }),
}));