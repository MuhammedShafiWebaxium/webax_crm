import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const sourceList = [
  'Unknown',
  'Youtube',
  'Google',
  'Facebook',
  'Referral',
  'Email',
  'WhatsApp',
  'Webinars',
  'Live Chat on Website',
  'Customer Support Calls',
];

const stageList = {
  Assigned: ['New'],
  Outreach: [
    'Invalid Number',
    'No Response',
    'Wrong Contact',
    'Call Back Later',
  ],
  Engaged: ['Contacted', 'Interested', 'Re-engaging', 'Not Interested'],
  'Closed Lost': ['Lost'],
  'Closed Won': ['Converted'],
};

const statusList = [
  'New',
  'Invalid Number', // The phone number is incorrect or not in service.
  'No Response', // Multiple attempts made, but no reply from the lead.
  'Wrong Contact', // The number belongs to someone else, not the intended lead.
  'Call Back Later', // The lead asked to be contacted at a later time.
  'Contacted',
  'Interested',
  'Not Interested',
  'Lost', // Lead decided not to proceed or chose a competitor.
  'Re-engaging', // Trying to revive a lost or inactive lead.
  'Converted', // Lead has become a customer.
];

const SettingsSchema = new Schema(
  {
    company: {
      type: Types.ObjectId,
      ref: 'Company',
      index: true,
      required: true,
    },
    adAccounts: [
      {
        platform: {
          type: String,
          required: true,
          enum: ['Facebook', 'Google', 'LinkedIn', 'Instagram'],
          default: 'Facebook',
        },
        adId: {
          type: Array,
          required: true,
        },
        accountName: {
          type: String,
          required: true,
        },
        accessToken: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['Active', 'Inactive', 'Suspended'],
          default: 'Active',
        },
        addedAt: {
          type: Date,
          default: Date.now(),
        },
        addedBy: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
      },
    ],
    lead: {
      status: { type: Array, default: statusList },
      defaultStatus: { type: String, default: 'New' },
      source: { type: Array, default: sourceList },
      defaultSource: { type: String, default: 'Unknown' },
      stage: { type: Object, default: stageList },
      defaultStage: { type: Object, default: 'Assigned' },
      customFields: { type: Object, default: {} }, // Stores extra fields
    },
  },
  { timestamps: true }
);

export default model('Settings', SettingsSchema);
