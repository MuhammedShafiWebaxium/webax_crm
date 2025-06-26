import mongoose from 'mongoose';

const SOURCE_OPTIONS = ['Facebook', 'Google', 'WhatsApp', 'Email'];
const STATUS_OPTIONS = ['Active', 'Inactive', 'Suspended', 'Pending'];

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    source: {
      type: String,
      required: true,
      enum: SOURCE_OPTIONS,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    website: { type: String, required: true, trim: true },
    industry: { type: String, required: true, trim: true },
    address: {
      street: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    phoneCode: { type: String, trim: true, required: true },
    staffLimit: { type: Number, default: 5, required: true },
    status: {
      type: String,
      default: 'Active',
      enum: STATUS_OPTIONS,
    },
    deleted: { type: Boolean, default: false },
    settings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Settings',
      required: true,
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
      },
    ],
    history: [
      {
        type: {
          type: String,
          trim: true,
          required: true,
        },
        date: {
          type: Date,
          required: true,
        },
        notes: {
          type: String,
          trim: true,
          required: true,
        },
        actionDoneBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

CompanySchema.index({ email: 1 }, { unique: true });
CompanySchema.index({ phone: 1 }, { unique: true });

CompanySchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'company', // field in User that holds the company reference
});

CompanySchema.set('toObject', { virtuals: true });
CompanySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Company', CompanySchema);
