import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    id: { 
        type: String, 
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }],
    date: { 
        type: String, 
        required: true 
    },
    total: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String, 
        required: true 
    },
    items: { 
        type: Number, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Middleware para gerar ID sequencial
OrderSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        const lastOrder = await this.constructor.findOne().sort({ id: -1 });
        const nextId = lastOrder ? parseInt(lastOrder.id) + 1 : 1001;
        this.id = nextId.toString();
    }
    next();
});

const Order = mongoose.model('Order', OrderSchema);

export default Order;