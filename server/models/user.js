import mongoose, { mongo } from 'mongoose';

const { Schema, model, Types } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    company: {
      type: Types.ObjectId,
      required: true,
      ref: 'Company',
    },
    designation: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phone: {
      type: String,
      required: true,
      unique: [true, 'This Contact Number Is Already In Use'],
      minlength: 7,
      trim: true,
    },
    phoneCode: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, 'This Email Is Already In Use'],
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Prefer Not To Say', 'Not Defined'],
      default: 'Not Defined',
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    conversionTargets: [
      {
        month: {
          type: Date,
          required: true,
        },
        target: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
      index: true,
      required: true,
    },
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
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default model('User', UserSchema);
