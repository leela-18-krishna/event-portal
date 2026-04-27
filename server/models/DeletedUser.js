import mongoose from 'mongoose';

// Create a separate connection for the archive database
const archiveConn = mongoose.createConnection('mongodb://127.0.0.1:27017/eventportal_archive');

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

// Use the archive connection to register the model
const DeletedUser = archiveConn.model('DeletedUser', DeletedUserSchema);

export default DeletedUser;
