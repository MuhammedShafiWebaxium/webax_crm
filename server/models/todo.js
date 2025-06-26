import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const TodoSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['Self', 'Assigned'],
      default: 'Self',
    },
    company: {
      type: Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      required: true,
      ref: 'User',
    },
    assignedTo: {
      type: [{ type: Types.ObjectId, ref: 'User' }],
      required: true,
      ref: 'User',
      validate: {
        validator: function (value) {
          return (
            this.type !== 'Assigned' ||
            (Array.isArray(value) && value.length > 0)
          );
        },
        message: "For 'Assigned' tasks, at least one assignee is required.",
      },
    },
    isTeamTask: { type: Boolean, default: false },
    teamName: {
      type: String,
      required: false,
      validate: {
        validator: function (value) {
          return this.isTeamTask ? !!value : true;
        },
        message: 'Team tasks must have a team name.',
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
      // validate: {
      //   validator: function (value) {
      //     return value > new Date();
      //   },
      //   message: 'Start date must be in the future.',
      // },
    },
    endDate: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End time must be after start time.',
      },
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    checklist: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
          default: null,
        },
      },
    ],
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Deleted'],
      required: true,
      default: 'Active',
    },
    completedTime: {
      type: Date,
      required: false,
      default: null,
    },
    completedBy: {
      type: Types.ObjectId,
      ref: 'User',
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: false,
    },
    deletedTime: {
      type: Date,
      required: false,
      default: null,
    },
  },
  { timestamps: true }
);

// Define indexes before exporting
TodoSchema.index({ createdBy: 1 });
TodoSchema.index({ assignedTo: 1 });
TodoSchema.index({ status: 1 });
TodoSchema.index({ company: 1 });

// Pre-save hook for automatic timestamps
TodoSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    if (this.status === 'Completed') {
      this.completedTime = new Date();
    }
    if (this.status === 'Deleted') {
      this.deletedTime = new Date();
    }
  }
  next();
});

export default model('Todo', TodoSchema);
