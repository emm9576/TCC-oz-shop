import mongoose from 'mongoose';

const ProdutoSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
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
    createdAt: { type: Date, default: Date.now }
});

// Middleware para gerar ID sequencial
ProdutoSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        const lastProduto = await this.constructor.findOne().sort({ id: -1 });
        const nextId = lastProduto ? parseInt(lastProduto.id) + 1 : 1001;
        this.id = nextId.toString();
    }
    next();
});

const Produto = mongoose.model('Produto', ProdutoSchema);

export default Produto;