import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "recruiter"],
      required: true,
    },
    profile: {
      bio: { type: String },
      skills: [{ type: String }],
      resume: { type: String },
      resumeOriginalName: { type: String },
      company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
      profilePhoto: { type: String, default: "" },
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving the user document
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

// Method to verify the password
userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Method to generate an access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      phone: this.phone,
      role: this.role,
    },
    process.env.JWT_ACCESS_SCERETE,
    { expiresIn: process.env.JWT_ACCESS_EXPIRE }
  );
};

// Method to generate a refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      phone: this.phone,
    },
    process.env.JWT_REFRESH_SCERETE,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE }
  );
};

const User = mongoose.model("User", userSchema);

export default User;
