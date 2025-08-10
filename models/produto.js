import mongoose from 'mongoose';

const ProdutoSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Removido required, será gerado automaticamente
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

const Produto = mongoose.model('Produto', ProdutoSchema);

export default Produto;