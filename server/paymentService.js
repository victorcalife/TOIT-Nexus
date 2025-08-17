/**
 * PAYMENT SERVICE - JavaScript Puro
 */

const DatabaseService = require( './services/DatabaseService' );
const db = new DatabaseService();

class PaymentService
{
    async getActivePlans()
    {
        return [
            {
                id: 'plan_basic',
                name: 'Básico',
                price: 99.90,
                currency: 'BRL',
                interval: 'monthly'
            }
        ];
    }

    async createSubscription( userId, subscriptionData )
    {
        return {
            id: `sub_${ Date.now() }`,
            userId,
            status: 'active'
        };
    }

    async getUserSubscription( userId )
    {
        return null;
    }

    async cancelSubscription( userId )
    {
        return { success: true };
    }

    async updatePaymentMethod( userId, paymentMethodId )
    {
        return { success: true };
    }

    async getUserInvoices( userId )
    {
        return [];
    }

    async retryPayment( userId, invoiceId )
    {
        return { success: true };
    }

    async getUserUsage( userId )
    {
        return { users: 5, storage: 2.5 };
    }

    async processWebhook( payload, signature )
    {
        return { success: true };
    }
}

const paymentService = new PaymentService();
module.exports = { PaymentService, paymentService };