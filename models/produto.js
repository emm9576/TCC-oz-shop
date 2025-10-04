import mongoose from 'mongoose';

const ProdutoSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: false },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    freteGratis: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    seller: { type: String, required: true, trim: true },
    imageMain: { type: String, required: true },
    images: { type: [String], default: [] },
    features: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },

    // 🌟 NOVO: Array para armazenar todas as avaliações individuais
    ratings: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // flag de soft delete
    deleted: { type: Boolean, default: false }
}, {
    toJSON: {
        virtuals: true,
        transform: (_, ret) => {
            if (ret.deleted === true) {
                // só retorna os campos essenciais se estiver deletado
                return {
                    _id: ret._id,
                    id: ret.id,
                    createdAt: ret.createdAt,
                    deleted: true,
                    __v: ret.__v
                };
            }
            if (!ret.deleted) {
                delete ret.deleted; // remove do JSON quando não for deletado
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
ProdutoSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const existingProdutos = await this.constructor.find({}, { id: 1 }).sort({ id: 1 });
            const existingIds = existingProdutos
                .map(produto => parseInt(produto.id))
                .filter(n => !isNaN(n))
                .sort((a, b) => a - b);

            let nextId = 1;
            for (let i = 0; i < existingIds.length; i++) {
                if (existingIds[i] !== nextId) break;
                nextId++;
            }

            this.id = nextId.toString();
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Produto = mongoose.model('Produto', ProdutoSchema);

export default Produto;