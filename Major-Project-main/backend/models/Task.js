import mongoose from 'mongoose';

const taskSchema = mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Hotel',
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    dueDate: {
      type: Date,
      required: true,
    },
    assignedTo: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Inventory', 'Menu', 'Staff', 'Maintenance', 'Other'],
      default: 'Other',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    attachments: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update progress based on status
taskSchema.pre('save', function (next) {
  if (this.status === 'Completed') {
    this.progress = 100;
    this.completedAt = Date.now();
  } else if (this.status === 'Cancelled') {
    this.completedAt = Date.now();
  }
  next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task; 