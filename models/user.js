import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    estado: { type: String, required: false },
    cidade: { type: String, required: false },
    rua: { type: String, required: false },
    cep: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
});

// Middleware para gerar ID sequencial
UserSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        const lastUser = await this.constructor.findOne().sort({ id: -1 });
        const nextId = lastUser ? parseInt(lastUser.id) + 1 : 1001;
        this.id = nextId.toString();
    }
    next();
});

const User = mongoose.model('User', UserSchema);

export default User;