import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification',
      required: true,
      index: true,
    },
    isRead: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// 📌 Indexes
deliverySchema.index({ user: 1, notification: 1 }, { unique: true });
deliverySchema.index({ user: 1, isRead: 1 });
deliverySchema.index({ deleted: 1 });

export default mongoose.model('NotificationDelivery', deliverySchema);
