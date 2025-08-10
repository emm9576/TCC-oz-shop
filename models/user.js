import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, unique: true }, // Removido required, será gerado automaticamente
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

const User = mongoose.model('User', UserSchema);

export default User;