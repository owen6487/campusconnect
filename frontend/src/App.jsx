import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Homepage from "./pages/Homepage";
import SearchPage from "./pages/Searchpage";
import Productdetails from "./components/Productdetails";
import Login from "./pages/Loginpage";
import FogotPasswordpage from "./pages/FogotPasswordpage";
import Resetpassword from "./pages/Resetpassword";
import Signup from "./pages/Signuppage";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profilepage";
import Sell from "./pages/SellPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Mylisting from "./components/Mylistings";
import Updatelisting from "./components/updateListings";
import Setting from "./pages/Settingpage";
import HowToBuy from "./pages/Howtobuy";
import HowToSell from "./pages/Howtosellpage";
import FaqPage from "./pages/FaqPage";
import PrivacyPolicy from "./components/Datapolicy";
import SafetyTips from "./components/Safetytips";
import TermsOfUse from "./components/Termsofuse";
import Feedback from "./components/feedback";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminUsers from "./components/Admin/AdminUsers";
import AdminListings from "./components/Admin/AdminListings";
import AdminFeedback from "./components/Admin/Adminfeedback";
import CampusManager from "./components/Admin/CampusManager";
import Wakeoverlay from "./components/Wakingoverlay";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <Wakeoverlay/>
      <main>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/product/:id" element={<Productdetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<FogotPasswordpage />} />
          <Route path="/reset-password" element={<Resetpassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/sell" element={<ProtectedRoute><Sell /></ProtectedRoute>} />
          <Route path="/mylistings" element={<ProtectedRoute><Mylisting /></ProtectedRoute>} />
          <Route path="/updatelistings/:id" element={<ProtectedRoute><Updatelisting /></ProtectedRoute>} />
          <Route path="/settings" element={<Setting />} />
          <Route path="/how-to-buy" element={<HowToBuy />} />
          <Route path="/how-to-sell" element={<HowToSell />} />
          <Route path="/safety-tips" element={<SafetyTips />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />

          <Route path="*" element={<NotFound />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="campusmanager" element={<CampusManager/>} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;

