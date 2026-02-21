import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, "Please enter your email"],
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      // required: [true, "Please enter a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
      // match: [
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      //   "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      // ],
    },
    googleId: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    // ---------------- Subscription ----------------
    subscription: {
      plan: {
        type: String,
        enum: ["FREE", "PRO", "PREMIUM"],
        default: "FREE",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "cancelled", "expired", "trial"],
        default: "inactive",
      },
      provider: {
        type: String,
        enum: ["razorpay"],
        default: "razorpay",
     },
      subscriptionId: {
        type: String,
        default: null,
      },

      currentPeriodStart: {
        type: Date,
        default: null,
      },

      currentPeriodEnd: {
        type: Date,
        default: null,
      },
    },

    // ---------------- Usage ----------------

    usage: {
      queriesUsed: {
        type: Number,
        default: 0,
      },

      lastReset: {
        type: Date,
        default: Date.now,
      },
    },

  },
  { timestamps: true }
);

// Hashing password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Comparing password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;