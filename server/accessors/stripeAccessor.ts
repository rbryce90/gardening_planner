import Stripe from 'npm:stripe';
import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config()

export default class StripeAccessor {
    readonly apiKey: string
    // readonly pubKey: string currently not being used 
    readonly stripe: Stripe

    constructor() {
        this.apiKey = env['STRIPE_SECRET_KEY']
        // this.pubKey = env['STRIPE_PUB_KEY']
        this.stripe = new Stripe(this.apiKey, { apiVersion: '2024-06-20' })
    }

    async getBalance() {
        return await this.stripe.balance.retrieve()
    }

    async createCustomer(params: { fullName: string, email: string, phoneNumber: string }) {
        return await this.stripe.customers.create({
            name: params.fullName,
            email: params.email,
            phone: params.phoneNumber
        })
    }
}