import mongoose from 'mongoose';

// Basic CRUD permission schema
const permissionSchema = new mongoose.Schema(
  {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },
  { _id: false }
);

// Assignable permission schema + followup added
const assignablePermissionSchema = new mongoose.Schema(
  {
    create: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    assign: { type: Boolean, default: false },
    assignedOnly: { type: Boolean, default: false }, //user can CRUD only assigned items.
    followup: { type: Boolean, default: false },
  },
  { _id: false }
);

// Simple read-only permission schema (for feedback and about)
const readOnlyPermissionSchema = new mongoose.Schema(
  {
    read: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    active: {
      type: Boolean,
      default: true,
    },

    permissions: {
      leads: { type: assignablePermissionSchema, default: () => ({}) },
      todos: { type: assignablePermissionSchema, default: () => ({}) },

      users: { type: permissionSchema, default: () => ({}) },
      companies: { type: permissionSchema, default: () => ({}) },

      settings: { type: permissionSchema, default: () => ({}) },

      about: { type: readOnlyPermissionSchema, default: () => ({}) }, // only read permission
      feedback: { type: readOnlyPermissionSchema, default: () => ({}) }, // only read permission

      exports: {
        allowed: { type: Boolean, default: false },
      },
      filters: {
        allowed: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

roleSchema.index({ name: 1, company: 1 }, { unique: true });

roleSchema.index({ company: 1, active: 1 });

// Check if role has permission to perform action on module
roleSchema.methods.can = function (module, action) {
  if (!this.active) return false;
  return this.permissions[module]?.[action] === true;
};

export default mongoose.model('Role', roleSchema);
