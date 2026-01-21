"use client";

import { useState } from "react";
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiLock, 
  FiCheck, 
  FiAlertCircle,
  FiActivity,
  FiAward,
  FiBriefcase,
  FiEye,
  FiEyeOff,
  FiUsers
} from "react-icons/fi";

const SPECIALIZATIONS = [
  "Weight Loss",
  "Muscle Building", 
  "Yoga",
  "Cardio",
  "CrossFit",
  "Boxing",
  "Pilates",
  "HIIT",
  "Strength Training",
  "Functional Training"
];

const EXPERIENCE_LEVELS = [
  "Less than 1 year",
  "1-2 years",
  "2-3 years",
  "3-5 years",
  "5+ years",
  "10+ years"
];

export default function CreatePTPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    specialization: "",
    experience: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all required fields");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/auth/create-pt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstname: form.firstName,
          lastname: form.lastName,
          email: form.email,
          phonenumber: form.phoneNumber,
          dob: form.dateOfBirth,
          gender: form.gender || "other",
          password: form.password,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to create PT");
      }

      setSuccess("Trainer account created successfully!");
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "",
        password: "",
        specialization: "",
        experience: "",
      });
      setStep(1);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 mb-4">
            <FiActivity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create New Trainer</h1>
          <p className="text-gray-400 mt-2">Add a new personal trainer to your fitness team</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
              step >= 1 ? 'bg-accent text-white' : 'bg-primary-200 text-gray-400'
            }`}>
              1
            </div>
            <div className={`w-24 h-1 mx-2 rounded transition-colors ${
              step >= 2 ? 'bg-accent' : 'bg-primary-200'
            }`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
              step >= 2 ? 'bg-accent text-white' : 'bg-primary-200 text-gray-400'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
            <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
            <FiCheck className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-primary-300 rounded-2xl shadow-2xl border border-primary-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <FiUser className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Personal Information</h2>
                    <p className="text-sm text-gray-400">Enter the trainer's basic details</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">First Name *</label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="firstName"
                          placeholder="John"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder-gray-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
                      <div className="relative">
                        <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          name="lastName"
                          placeholder="Doe"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder-gray-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        placeholder="trainer@fitnessstudio.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="+84 123 456 789"
                        value={form.phoneNumber}
                        onChange={handleChange}
                        className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* DOB & Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Date of Birth</label>
                      <div className="relative">
                        <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={form.dateOfBirth}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Gender</label>
                      <div className="relative">
                        <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="w-full pl-11 pr-4 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none"
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Password *</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Minimum 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-11 pr-12 py-3 bg-primary-200 border border-primary-100 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Info */}
            {step === 2 && (
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <FiBriefcase className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Professional Details</h2>
                    <p className="text-sm text-gray-400">Set up the trainer's expertise and experience</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Specialization */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Specialization</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {SPECIALIZATIONS.map(spec => (
                        <button
                          key={spec}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, specialization: spec }))}
                          className={`p-3 rounded-xl text-sm font-medium transition-all ${
                            form.specialization === spec
                              ? 'bg-accent text-white border-2 border-accent'
                              : 'bg-primary-200 text-gray-300 border-2 border-primary-100 hover:border-accent/50'
                          }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-3">Experience Level</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {EXPERIENCE_LEVELS.map(exp => (
                        <button
                          key={exp}
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, experience: exp }))}
                          className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            form.experience === exp
                              ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50'
                              : 'bg-primary-200 text-gray-300 border-2 border-primary-100 hover:border-amber-500/30'
                          }`}
                        >
                          <FiAward className="w-4 h-4" />
                          {exp}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Card */}
                  <div className="mt-6 p-5 bg-primary-200/50 rounded-xl border border-primary-100">
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Preview</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center text-white font-bold text-lg">
                        {form.firstName.charAt(0)}{form.lastName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {form.firstName || 'First'} {form.lastName || 'Last'}
                        </h4>
                        <p className="text-sm text-gray-400">{form.email || 'email@example.com'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {form.specialization && (
                            <span className="px-2 py-0.5 bg-accent/20 text-accent rounded text-xs">
                              {form.specialization}
                            </span>
                          )}
                          {form.experience && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs">
                              {form.experience}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="px-8 py-5 bg-primary-200/30 border-t border-primary-100 flex justify-between">
              {step === 1 ? (
                <>
                  <div></div>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    className="px-6 py-3 bg-accent hover:bg-accent/90 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    Continue
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-primary-200 hover:bg-primary-100 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-5 h-5" />
                        Create Trainer
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 p-5 bg-primary-300/50 rounded-xl border border-primary-100">
          <h3 className="text-sm font-medium text-white mb-3">💡 Tips for creating trainer accounts</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li>• Use a professional email address for the trainer</li>
            <li>• Choose a strong password with at least 6 characters</li>
            <li>• Specialization helps match trainers with members' goals</li>
            <li>• Experience level is displayed on the trainer's profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
