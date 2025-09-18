import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { 
        type: String, 
        unique: true,
        required: false // NÃO tem required: true - será gerado pelo middleware
    },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    estado: { type: String, required: false },
    cidade: { type: String, required: false },
    rua: { type: String, required: false },
    cep: { type: String, required: false },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user',
        required: true 
    },
    createdAt: { type: Date, default: Date.now },

    // campo auxiliar para soft delete
    deleted: { type: Boolean, default: false, select: false }
}, {
    toJSON: { virtuals: true, transform: (_, ret) => {
        // se deleted for false, remove do objeto final
        if (!ret.deleted) {
            delete ret.deleted;
        }
        return ret;
    }},
    toObject: { virtuals: true, transform: (_, ret) => {
        if (!ret.deleted) {
            delete ret.deleted;
        }
        return ret;
    }}
});

// Middleware para gerar ID sequencial (preenche lacunas)
UserSchema.pre('save', async function(next) {
    if (this.isNew && !this.id) {
        try {
            const existingUsers = await this.constructor.find({}, { id: 1 }).sort({ id: 1 });
            const existingIds = existingUsers.map(user => parseInt(user.id)).sort((a, b) => a - b);
            
            let nextId = 1;
            for (let i = 0; i < existingIds.length; i++) {
                if (existingIds[i] !== nextId) {
                    break;
                }
                nextId++;
            }
            
            this.id = nextId.toString();
            console.log('🆔 ID gerado:', this.id);
        } catch (error) {
            console.error('❌ Erro ao gerar ID:', error);
            return next(error);
        }
    }
    next();
});

// Middleware para "soft delete"
UserSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        // zera os campos e marca como deletado
        await this.model('User').updateOne(
            { _id: this._id },
            {
                $set: {
                    name: null,
                    password: null,
                    phone: null,
                    estado: null,
                    cidade: null,
                    rua: null,
                    cep: null,
                    createdAt: this.createdAt, // mantém a data original
                    deleted: true
                }
            }
        );
        next(new Error("Soft delete realizado: documento não foi removido, apenas limpo."));
    } catch (err) {
        next(err);
    }
});

const User = mongoose.model('User', UserSchema);

export default User;