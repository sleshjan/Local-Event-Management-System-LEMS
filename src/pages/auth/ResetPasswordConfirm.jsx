import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";
import { authService } from "../../services/authService";
import { parseApiError } from "../../services/api";
import { Eye, EyeOff } from "lucide-react";

const ResetPasswordConfirm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        password: "",
        password_confirmation: "",
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [token, setToken] = useState("");
    const [email, setEmail] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const tokenParam = searchParams.get("token");
        const emailParam = searchParams.get("email");
        if (tokenParam) setToken(tokenParam);
        if (emailParam) setEmail(emailParam);

        if (!tokenParam || !emailParam) {
            setApiError("Invalid password reset link. Token or email is missing.");
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
        if (apiError) setApiError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setApiError("");
        setSuccessMessage("");

        if (formData.password !== formData.password_confirmation) {
            setErrors({ password_confirmation: "Passwords do not match" });
            setLoading(false);
            return;
        }
        if (formData.password.length < 8) {
            setErrors({ password: "Password must be at least 8 characters" });
            setLoading(false);
            return;
        }

        try {
            await authService.resetPassword({
                email,
                token,
                password: formData.password,
                password_confirmation: formData.password_confirmation,
            });
            setSuccessMessage("Password reset successfully! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error) {
            setApiError(parseApiError(error));
        } finally {
            setLoading(false);
        }
    };

    const renderPasswordInput = (label, name, value, showState, setShowState) => (
        <div className="relative">
            <Input
                label={label}
                type={showState ? "text" : "password"}
                name={name}
                value={value}
                onChange={handleChange}
            />
            <button
                type="button"
                onClick={() => setShowState(!showState)}
                className="absolute right-4 top-[38px] text-gray-500 hover:text-gray-700"
                tabIndex="-1"
            >
                {showState ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            {errors[name] && (
                <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
            )}
        </div>
    );

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-10 border border-gray-100">
                <div className="mb-8"><Logo /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>

                {apiError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {apiError}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                        {successMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {renderPasswordInput("New Password", "password", formData.password, showPassword, setShowPassword)}

                    {renderPasswordInput("Confirm Password", "password_confirmation", formData.password_confirmation, showConfirmPassword, setShowConfirmPassword)}

                    <Button
                        text={loading ? "Resetting..." : "Reset Password"}
                        type="submit"
                        fullWidth
                        disabled={!token || loading}
                    />
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordConfirm;
