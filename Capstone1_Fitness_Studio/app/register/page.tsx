"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: form.firstName,
          lastname: form.lastName,
          email: form.email,
          phonenumber: form.phoneNumber,
          dob: form.dateOfBirth,
          gender: form.gender,
          password: form.password,
          role: "user" // default user
        }),
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to sign up");
      }

      const data = await res.json();
      
      // Auto login after registration
      const loginRes = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
        credentials: "include"
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        // Save user to localStorage
        localStorage.setItem("user", JSON.stringify(loginData.user));
        // Redirect to choose membership page for payment
        router.push("/choosemembership");
      } else {
        // If auto-login fails, redirect to login page
        router.push("/login");
      }
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-950 to-gray-900 py-8">
      <div className="w-full max-w-2xl p-8 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Join Our Fitness Studio</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-lg text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="firstName" placeholder="First Name *" value={form.firstName} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500" />
            <input type="text" name="lastName" placeholder="Last Name *" value={form.lastName} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500" />
          </div>

          <input type="email" name="email" placeholder="Email *" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500" />
          <input type="tel" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500" />
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500">
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="password" name="password" placeholder="Password *" value={form.password} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500" />
            <input type="password" name="confirmPassword" placeholder="Confirm Password *" value={form.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-500" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-500 transition disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-gray-300 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
