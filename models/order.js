import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    id: { 
        type: String, 
        unique: true,
        required: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produto',
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
    },

    // Campos para sistema de pagamento
    paymentMethod: {
        type: String,
        enum: ['pix', 'cartao', 'boleto'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'approved', 'failed', 'expired'],
        default: 'pending'
    },
    paymentDetails: {
        // Apenas para PIX
        pixCode: {
            type: String,
            sparse: true,
            index: true
        },
        pixExpiresAt: {
            type: Date
        }
    },

    // flag de soft delete
    deleted: { type: Boolean, default: false }
}, {
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            if (ret.deleted === true) {
                return {
                    _id: ret._id,
                    id: ret.id,
                    createdAt: ret.createdAt,
                    deleted: true,
                    __v: ret.__v
                };
            }
            if (!ret.deleted) {
                delete ret.deleted;
            }
            return ret;
        }
    },
    toObject: {
        virtuals: true,
        transform: (_, ret) => {
            if (ret.deleted === true) {
                return {
                    _id: ret._id,
                    id: ret.id,
                    createdAt: ret.createdAt,
                    deleted: true,
                    __v: ret.__v
                };
            }
            if (!ret.deleted) {
                delete ret.deleted;
            }
            return ret;
        }
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