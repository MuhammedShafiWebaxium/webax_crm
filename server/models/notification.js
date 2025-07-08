import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'error', 'system', 'custom'],
      default: 'info',
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    link: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    isBroadcast: { type: Boolean, default: false },
    targetCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSystemGenerated: { type: Boolean, default: false },
    scheduledFor: { type: Date },
    hasBeenSent: {
      type: Boolean,
      default: false,
    },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// 📌 Indexes
notificationSchema.index({ deleted: 1 });
notificationSchema.index({ isBroadcast: 1, scheduledFor: 1 });
notificationSchema.index({ targetCompanies: 1 });
notificationSchema.index({ hasBeenSent: 1, deleted: 1, scheduledFor: 1 });

notificationSchema.virtual('deliveries', {
  ref: 'NotificationDelivery',
  localField: '_id',
  foreignField: 'notification',
});

notificationSchema.set('toObject', { virtuals: true });
notificationSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);
