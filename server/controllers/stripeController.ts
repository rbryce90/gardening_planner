import StripeAccessor from '../accessors/stripeAccessor.ts'
import { User } from "../models/models.ts";
import createFullName from "../utils/createFullName.ts";

const stripeAccessor = new StripeAccessor()

export const getBalance = async () => {
    return await stripeAccessor.getBalance()
}

export const createCustomer = async (user: User) => {
    const fullName = createFullName(user)
    const { email, phoneNumber } = user;
    return await stripeAccessor.createCustomer({ fullName, email, phoneNumber })
}