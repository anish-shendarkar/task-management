"use client";

import { useState } from "react";

export default function AuthPage() {
    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitForm = async () => {
        // Validation
        if (mode === "signup") {
            if (!form.name || !form.email || !form.password || !form.confirmPassword) {
                return alert("Please fill in all fields");
            }
            if (form.password !== form.confirmPassword) {
                return alert("Passwords do not match");
            }
        } else {
            if (!form.email || !form.password) {
                return alert("Please fill in all fields");
            }
        }

        setLoading(true);
        const endpoint = mode === "login"
            ? "http://localhost:3333/api/v1/login"
            : "http://localhost:3333/api/v1/signup";

        const payload = mode === "login"
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, password: form.password };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            setLoading(false);

            if (!res.ok) {
                return alert(data.message || "Something went wrong");
            }

            // Store token and role in localStorage
            if (data.token) {
                localStorage.setItem("token", data.token);
            }
            if (data.role) {
                localStorage.setItem("role", data.role);
            }

            alert(mode === "login" ? "Login successful!" : "Account created successfully!");

            // Reset form on success
            setForm({
                name: "",
                email: "",
                password: "",
                confirmPassword: "",
            });

            // Redirect based on role
            if (data.role === "admin") {
                window.location.href = "http://localhost:3000/admin";
            } else if (data.role === "user") {
                window.location.href = "http://localhost:3000/user";
            }
        } catch (error) {
            setLoading(false);
            alert("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
                {/* TITLE */}
                <h1 className="text-2xl font-semibold text-center mb-6">
                    {mode === "login" ? "Login to your account" : "Create an account"}
                </h1>

                {/* TOGGLE BUTTONS */}
                <div className="flex mb-6">
                    <button
                        onClick={() => setMode("login")}
                        className={`w-1/2 py-2 text-sm font-medium border-b-2 ${mode === "login"
                                ? "border-black text-black"
                                : "border-gray-300 text-gray-400"
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setMode("signup")}
                        className={`w-1/2 py-2 text-sm font-medium border-b-2 ${mode === "signup"
                                ? "border-black text-black"
                                : "border-gray-300 text-gray-400"
                            }`}
                    >
                        Signup
                    </button>
                </div>

                {/* FORMS */}
                <div className="space-y-4">
                    {mode === "signup" && (
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />

                    {mode === "signup" && (
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    )}

                    <button
                        onClick={submitForm}
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                    >
                        {loading
                            ? "Please wait..."
                            : mode === "login"
                                ? "Login"
                                : "Create Account"}
                    </button>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    {mode === "login" ? (
                        <>
                            Don't have an account?{" "}
                            <button
                                onClick={() => setMode("signup")}
                                className="text-black underline"
                            >
                                Sign up
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button
                                onClick={() => setMode("login")}
                                className="text-black underline"
                            >
                                Login
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}