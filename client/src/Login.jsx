import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { api, setAuthToken } from "./api";
import { FormServerError, TextField } from "./components/FormField";
import { loginSchema, registerSchema } from "./schemas/validation";

function AuthForm({ mode, onLogin }) {
  const [serverError, setServerError] = useState("");
  const isRegister = mode === "register";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: {
      name: "",
      email: isRegister ? "" : "admin@woundtech.net",
      password: "",
    },
  });

  async function onSubmit(data) {
    setServerError("");
    try {
      const result = isRegister
        ? await api.auth.register(data)
        : await api.auth.login({ email: data.email, password: data.password });
      setAuthToken(result.token);
      onLogin(result.user);
    } catch (err) {
      setAuthToken(null);
      setServerError(err?.message || 'An unexpected error occurred.');
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {isRegister && (
        <TextField
          label="Full Name"
          name="name"
          register={register}
          error={errors.name}
          required
          variant="login"
        />
      )}
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        register={register}
        error={errors.email}
        required
        variant="login"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        register={register}
        error={errors.password}
        required
        variant="login"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-teal-600 py-3 font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        {isSubmitting
          ? isRegister
            ? "Creating account..."
            : "Signing in..."
          : isRegister
            ? "Create Account"
            : "Sign In"}
      </button>
      <FormServerError message={serverError} />
    </form>
  );
}

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const isRegister = mode === "register";

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-teal-700 via-teal-800 to-slate-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">
            Woundtech
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Patient Visit Tracker
          </h1>
          <p className="mt-2 text-slate-500">
            {isRegister
              ? "Create a staff account"
              : "Sign in to manage clinician visits"}
          </p>
        </div>

        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              !isRegister
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              isRegister
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Register
          </button>
        </div>

        <AuthForm key={mode} mode={mode} onLogin={onLogin} />

        {!isRegister ? (
          <p className="mt-6 text-center text-sm text-slate-500">
            Demo admin:{" "}
            <span className="font-medium text-slate-700">
              admin@woundtech.net
            </span>{" "}
            / <span className="font-medium text-slate-700">woundtech123</span>
          </p>
        ) : (
          <p className="mt-6 text-center text-sm text-slate-500">
            New accounts are saved in the{" "}
            <span className="font-medium text-slate-700">users</span> table for
            sign-in.
          </p>
        )}
      </div>
    </div>
  );
}
