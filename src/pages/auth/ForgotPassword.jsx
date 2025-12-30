import React, { useState } from "react";
import { Link } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { authService } from "../../services/authService";
import { parseApiError } from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      setSuccess(response.status || "A password reset link has been sent to your email.");
      setEmail(""); // Optional: clear email after successful send
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
        {/* App header */}
        <div className="mb-8">
          <Logo />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Forgot Password?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Enter your email to receive a password reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>

            {/* Reused Input component */}
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(""); // Clear error on type
              }}
            />
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Reused Button component */}
          <Button
            text={loading ? "Sending..." : "Send Reset Link"}
            type="submit"
            fullWidth
            disabled={loading}
          />
        </form>

        {/* Link back to Login */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-purple-600 font-medium hover:underline"
          >
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
