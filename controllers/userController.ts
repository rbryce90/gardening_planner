import { getAllUsers } from "../repositories/userRepository.ts";

export const getUsers = async () => {
    return await getAllUsers();
};


