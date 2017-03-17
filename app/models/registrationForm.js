var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var bcrypt 		 = require('bcrypt-nodejs');

// Registration Form schema
var RegistrationFormSchema = new Schema({
  studentFirst: { type: String, required: true },
	studentLast: { type: String, required: true },
  studentGrade: { type: String, required: true },
	studentAge: { type: String, required: true },
  parentFirst: { type: String, required: true },
  parentLast: { type: String },
	parentEmail: { type: String }
});

module.exports = mongoose.model('RegistrationForm', RegistrationFormSchema);
