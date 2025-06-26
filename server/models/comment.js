import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        url: String,
        fileType: String, // e.g., 'image', 'pdf'
      },
    ],
  },
  { timestamps: true }
);

CommentSchema.index({ taskId: 1 });
CommentSchema.index({ createdBy: 1 });

export default mongoose.model('Comment', CommentSchema);
