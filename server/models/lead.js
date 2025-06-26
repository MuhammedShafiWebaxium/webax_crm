import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const leadSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    phoneCode: {
      type: String,
      trim: true,
      required: true,
    },
    alternativeNumber: {
      type: String,
      trim: true,
    },
    alternativePhoneCode: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    leadId: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      required: true,
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
      index: true,
      required: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Prefer Not To Say', 'Not Defined'],
      default: 'Not Defined',
      required: true,
    },
    leadSource: {
      source: {
        type: String,
        required: true,
        default: 'Unknown',
        trim: true,
      },
      sourceLeadId: {
        type: String,
        trim: true,
      },
      accountInfo: {
        accountId: {
          type: String,
          trim: true,
        },
        accountName: {
          type: String,
          trim: true,
        },
      },
      campaignInfo: {
        campaignId: {
          type: String,
          trim: true,
        },
        campaignName: {
          type: String,
          trim: true,
        },
        adSetId: {
          type: String,
          trim: true,
        },
        adId: {
          type: String,
          trim: true,
        },
      },
    },
    stage: {
      type: String,
      required: true,
      trim: true,
    },
    eligibility: {
      type: String,
      enum: ['Eligible', 'Ineligible', 'Unknown'],
      default: 'Unknown',
      index: true,
      trim: true,
      required: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    convertedDate: Date,
    initialNote: {
      type: String,
      required: true,
    },
    lastFollowup: Date,
    nextFollowup: {
      type: Date,
      index: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assigned: {
      staff: {
        type: Types.ObjectId,
        ref: 'User',
      },
      assignedDate: Date,
      assignedBy: {
        type: Types.ObjectId,
        ref: 'User',
      },
      history: [
        {
          type: {
            type: 'String',
            required: true,
            default: 'Assign',
            enum: ['Assign', 'Re-Assign'],
          },
          staff: { type: Types.ObjectId, ref: 'User', required: true },
          assignedDate: { type: Date, required: true },
          assignedBy: { type: Types.ObjectId, ref: 'User', required: true },
          assignedNote: {
            type: String,
            trim: true,
          },
        },
      ],
    },
    followup: [
      {
        nextFollowupDate: Date,
        date: Date,
        notes: {
          type: String,
          trim: true,
        },
        followedBy: { type: Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          trim: true,
        },
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
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

export default model('Lead', leadSchema);
