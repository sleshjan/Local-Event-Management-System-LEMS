import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, FileText, Lock, Eye } from "lucide-react";
import Logo from "../components/common/Logo";

const TermsAndPrivacy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Logo />
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-4xl mx-auto px-4 py-8 md:py-12">
                <div className="bg-white rounded-3xl shadow-sm border p-8 md:p-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Terms and Privacy Policy</h1>

                    <div className="space-y-12">
                        {/* Terms of Service */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FileText className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
                            </div>

                            <div className="space-y-4 text-gray-600 leading-relaxed">
                                <p>Welcome to LEMS. By accessing or using our platform, you agree to be bound by these terms.</p>

                                <div className="pl-4 border-l-4 border-purple-100 space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">1. Acceptance of Terms</h3>
                                        <p>By creating an account, you agree to these legal terms. If you do not agree, please do not use our services.</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900">2. User Responsibilities</h3>
                                        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900">3. Event Participation</h3>
                                        <p>Users must comply with all event-specific rules and local regulations when attending events discovered through our platform.</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-900">4. Content Guidelines</h3>
                                        <p>Any content posted must not be illegal, offensive, or infringing on intellectual property rights.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <hr className="border-gray-100" />

                        {/* Privacy Policy */}
                        <section>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                            </div>

                            <div className="space-y-6 text-gray-600 leading-relaxed">
                                <p>Your privacy is important to us. Here's how we handle your information:</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                                            <Eye className="w-5 h-5 text-gray-400" />
                                            What we collect
                                        </div>
                                        <p className="text-sm">We collect profile info, location data (Province/District), and preferences to provide personalized event discovery.</p>
                                    </div>

                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-2 mb-3 text-gray-900 font-semibold">
                                            <Lock className="w-5 h-5 text-gray-400" />
                                            Data Security
                                        </div>
                                        <p className="text-sm">Your passwords are encrypted, and we use industry-standard security measures to protect your personal information.</p>
                                    </div>
                                </div>

                                <div className="pl-4 border-l-4 border-green-100">
                                    <h3 className="font-semibold text-gray-900 mb-2">How we use your data</h3>
                                    <ul className="list-disc list-inside space-y-2 text-sm italic">
                                        <li>To manage your account and registrations.</li>
                                        <li>To suggest events based on your interests.</li>
                                        <li>To communicate important updates about events.</li>
                                        <li>We never sell your personal data to third parties.</li>
                                    </ul>
                                </div>
                            </div>
                        </section>

                        <div className="bg-purple-50 rounded-2xl p-6 text-center">
                            <p className="text-purple-700 text-sm">
                                Last updated: December 2025. If you have any questions, please contact our support team.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="py-8 text-center text-gray-400 text-sm border-t bg-white">
                © 2025 LEMS. All rights reserved.
            </footer>
        </div>
    );
};

export default TermsAndPrivacy;
