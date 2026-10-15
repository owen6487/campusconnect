import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import useAuth from "../Hooks/useAuth"; 
import usePageMeta from "../Hooks/usePageMeta";
import logo from "../assets/logo.png";
import api from "../apis";

const inputClass =
  "w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

function Signuppage() {
  usePageMeta({ title: "Sign up", noindex: true, description: "Create your Campus Connect account to buy and sell items on campus." });
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const googleClientId = import.meta.env.GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const hasGoogleLogin = !!googleClientId && googleClientId !== "YOUR_GOOGLE_CLIENT_ID";
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [campuses, setCampuses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // Load campuses once
  useEffect(() => {
    api.get('/api/campuses/all')
      .then(({ data }) => setCampuses(data))
      .catch(() => setError("Couldn't load campuses. Please refresh the page."));
  }, []);

  // Load branches whenever the campus changes
  useEffect(() => {
    setSelectedBranch("");              
    setBranches([]);
    if (!selectedCampus) return;

    let ignore = false;                 
    api.get(`/api/branches/all/${selectedCampus}`)
      .then(({ data }) => { if (!ignore) setBranches(data); })
      .catch(() => { if (!ignore) setError("Couldn't load branches."); });
    return () => { ignore = true; };
  }, [selectedCampus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }
    setLoading(true);
    try {
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        campus: selectedCampus,
        branch: selectedBranch || undefined,   
      });
      navigate("/login", { replace: true, state: { message: "Account created. Please log in." } });
    } catch (err) {
        console.error("Signup error:", err);
      setError(err.response?.data?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async (credential) => {
    setError("");
    setLoading(true);
    try {
      const user = await googleLogin(credential);
      navigate(user.campus ? "/profile" : "/onboarding", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Google signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-6">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md sm:p-7">
        <div className="mb-4 flex flex-col items-center gap-1 text-center">
          <Link to="/">
            <img src={logo} alt="Campus Connect" className="h-10 w-auto sm:h-12" />
          </Link>
          <h2 className="text-xl font-bold">Campus Connect</h2>
          <p className="text-xs text-gray-500">Create your account</p>
        </div>

        {error && <p role="alert" className="mb-3 rounded bg-red-50 p-2 text-xs text-red-500">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="mb-1 block text-xs font-semibold text-gray-700">Name</label>
            <input id="name" type="text" autoComplete="name" value={form.name}
              onChange={update("name")} required className={inputClass} />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="mb-1 block text-xs font-semibold text-gray-700">Email</label>
            <input id="email" type="email" autoComplete="email" autoCapitalize="none"
              value={form.email} onChange={update("email")} required className={inputClass} />
          </div>

          {/* Campus and Branch side-by-side flex container */}
          <div className="mb-3 flex flex-row gap-3">
            <div className="flex-1">
              <label htmlFor="campus" className="mb-1 block text-xs font-semibold text-gray-700">Campus</label>
              <select id="campus" value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)} required
                className={`${inputClass} bg-white truncate`}>
                <option value="">Select campus</option>
                {campuses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex-1">
              <label htmlFor="branch" className="mb-1 block text-xs font-semibold text-gray-700">Branch</label>
              <select id="branch" value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                disabled={!selectedCampus}
                className={`${inputClass} bg-white truncate disabled:opacity-50`}>
                <option value="">{selectedCampus ? "Branch (opt.)" : "Campus first"}</option>
                {branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="mb-1 block text-xs font-semibold text-gray-700">Password</label>
            <input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password"
              value={form.password} onChange={update("password")} required className={inputClass} />
            <p className="mt-0.5 text-[10px] text-gray-500">
              Min 8 chars with uppercase, lowercase, number & special character.
            </p>
          </div>

          <div className="mb-3">
            <label htmlFor="confirmPassword" className="mb-1 block text-xs font-semibold text-gray-700">Confirm password</label>
            <input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password"
              value={form.confirmPassword} onChange={update("confirmPassword")} required className={inputClass} />
          </div>

          <label className="mb-4 flex items-center text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={showPassword} onChange={() => setShowPassword((s) => !s)}
              className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Show passwords
          </label>

          <button type="submit" disabled={loading}
            className={`w-full rounded bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors ${loading ? "cursor-not-allowed opacity-50" : ""}`}>
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {hasGoogleLogin && (
          <>
            <div className="my-3 flex items-center gap-3 text-xs text-gray-400">
              <div className="h-px flex-1 bg-gray-200" /> or <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex w-full justify-center overflow-hidden">
              <GoogleLogin
                onSuccess={({ credential }) => handleGoogleSignup(credential)}
                onError={() => setError("Google signup failed. Please try again.")}
                text="signup_with"
                size="large"
                width="100%"
              />
              
            </div>
          </>
        )}

        <p className="mt-4 text-center text-xs text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-500 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signuppage;