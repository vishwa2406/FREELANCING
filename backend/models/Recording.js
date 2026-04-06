const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema(
  {
    // Relationship to Order
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    // Relationship to freelancer
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Relationship to client (for audit)
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Relationship to project
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    // Recording metadata
    filename: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      default: 'video/webm',
      enum: ['video/webm', 'video/mp4', 'video/ogg']
    },
    fileSize: {
      type: Number,
      required: true // in bytes
    },
    // Storage path/URL
    // For local: /uploads/recordings/filename
    // For cloud: full S3 URL or reference
    storagePath: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    // Recording session times
    recordStartTime: {
      type: Date,
      required: true
    },
    recordEndTime: {
      type: Date,
      required: true
    },
    // Duration in seconds
    duration: {
      type: Number
    },
    // Status of recording
    status: {
      type: String,
      enum: ['recording', 'processing', 'completed', 'error'],
      default: 'completed'
    },
    // Error message if any
    errorMessage: {
      type: String,
      default: ''
    },
    // Access logs for audit trail (admin only)
    accessLogs: [
      {
        admin: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        viewedAt: {
          type: Date,
          default: Date.now
        },
        downloadedAt: Date
      }
    ],
    // Metadata
    metadata: {
      resolution: String,
      codec: String,
      bitrate: String
    }
  },
  { 
    timestamps: true,
    // Restrict sensitive fields from being returned in queries
    toJSON: {
      transform: function(doc, ret) {
        // Remove sensitive fields for non-admin users
        return ret;
      }
    }
  }
);

// Index for finding recordings by order and freelancer
recordingSchema.index({ order: 1, freelancer: 1 });
recordingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Recording', recordingSchema);
