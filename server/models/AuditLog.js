import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
    }
  },
  { timestamps: true }
);

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
