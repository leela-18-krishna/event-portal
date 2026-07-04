import mongoose from 'mongoose';

const DeletedUserSchema = new mongoose.Schema({
  originalId: String,
  name: String,
  email: String,
  phone: String,
  role: String,
  profilePic: String,
  securityQuestion: String,
  securityAnswer: String,
  deletedAt: {
    type: Date,
    default: Date.now
  }
});

// Reuse the app's existing MongoDB connection, just pointed at a
// separate database ("eventportal_archive") for archived/deleted users.
const archiveConn = mongoose.connection.useDb('eventportal_archive', { useCache: true });

const DeletedUser = archiveConn.model('DeletedUser', DeletedUserSchema);

export default DeletedUser;
