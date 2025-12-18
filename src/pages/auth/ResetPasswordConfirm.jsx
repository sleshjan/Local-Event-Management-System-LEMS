import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { authService } from "../../services/authService";

const ResetPasswordConfirm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState("");
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        const emailParam = searchParams.get("email");
        if (tokenParam) setToken(tokenParam);
        if (emailParam) setEmail(emailParam);

        if (!tokenParam) {
            setStatus("Invalid or missing token.");
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: "Passwords do not match" });
            return;
        }
        if (formData.password.length < 8) {
            setErrors({ password: "Password must be at least 8 characters" });
            return;
        }

        try {
            await authService.resetPassword({
                email,
                token,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            });
            alert("Password reset successfully! Please login.");
            navigate("/login");
        } catch (error) {
            setStatus(error.message || "Failed to reset password.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
                <div className="mb-8"><Logo /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>

                {status && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{status}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <Input
                        label="New Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        error={errors.password_confirmation}
                    />
                    <Button text="Reset Password" type="submit" fullWidth disabled={!token} />
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;
