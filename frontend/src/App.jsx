import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import { SocketProvider } from "./context/SocketContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { Shield } from "lucide-react";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./App.css";

// Lazy load pages for performance optimization
const Home = lazy(() => import("./pages/Home.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const PaymentStatus = lazy(() => import("./pages/PaymentStatus.jsx"));

// --- Admin Pages ---
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview.jsx"));
const ManageOfficers = lazy(() => import("./pages/admin/ManageOfficers.jsx"));
const VehicleRegistry = lazy(() => import("./pages/admin/VehicleRegistry.jsx"));
const UnregisteredVehicles = lazy(() => import("./pages/admin/UnregisteredVehicles.jsx"));
const ViolationManagement = lazy(() => import("./pages/admin/ViolationManagement.jsx"));
const FineManagement = lazy(() => import("./pages/admin/FineManagement.jsx"));
const TrafficRules = lazy(() => import("./pages/admin/TrafficRules.jsx"));
const CitizenComplaints = lazy(() => import("./pages/admin/CitizenComplaints.jsx"));
const GlobalReports = lazy(() => import("./pages/admin/GlobalReports.jsx"));
const SystemNotifications = lazy(() => import("./pages/admin/SystemNotifications.jsx"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings.jsx"));

// --- Police Pages ---
const PoliceOverview = lazy(() => import("./pages/police/PoliceOverview.jsx"));
const AIScan = lazy(() => import("./pages/police/AIScan.jsx"));
const ManualEntry = lazy(() => import("./pages/police/ManualEntry.jsx"));
const VerifyDesk = lazy(() => import("./pages/police/VerifyDesk.jsx"));
const ViolationRecords = lazy(() => import("./pages/police/ViolationRecords.jsx"));
const VehicleSearch = lazy(() => import("./pages/police/VehicleSearch.jsx"));
const EvidenceVault = lazy(() => import("./pages/police/EvidenceVault.jsx"));

// --- Owner Pages ---
const OwnerOverview = lazy(() => import("./pages/owner/OwnerOverview.jsx"));
const MyViolations = lazy(() => import("./pages/owner/MyViolations.jsx"));
const MyPhotos = lazy(() => import("./pages/owner/MyPhotos.jsx"));
const PaymentHistory = lazy(() => import("./pages/owner/PaymentHistory.jsx"));
const MyVehicles = lazy(() => import("./pages/owner/MyVehicles.jsx"));
const SendComplaint = lazy(() => import("./pages/owner/SendComplaint.jsx"));

const Loader = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-white font-sans overflow-hidden relative">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/5 blur-[120px] rounded-full"></div>
    <div className="relative z-10 space-y-10 flex flex-col items-center">
      <div className="relative">
        <div className="absolute -inset-4 border-4 border-primary-950/10 rounded-full animate-spin"></div>
        <div className="w-24 h-24 bg-primary-950 rounded-[28px] flex items-center justify-center shadow-2xl border-b-8 border-accent-crimson animate-pulse">
          <Shield className="text-white w-12 h-12" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tighter text-primary-950 uppercase italic leading-none block">
          TVDS <span className="text-accent-crimson font-light text-2xl">GRID</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-neutral-300 italic animate-pulse">
          Initializing Neural Nodes...
        </p>
      </div>
    </div>
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
      <div className="flex items-center space-x-2">
        <div className="w-1 h-1 rounded-full bg-accent-emerald animate-ping"></div>
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-200">
          Secure Sync Active
        </span>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <SocketProvider>
            <Router>
              <Suspense fallback={<Loader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/payment-status" element={<PaymentStatus />} />

                  {/* Protected Dashboard Route (Entrypoint, will redirect based on role) */}
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

                  {/* --- Admin Specific Routes --- */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminOverview /></ProtectedRoute>} />
                  <Route path="/officers" element={<ProtectedRoute allowedRoles={["Admin"]}><ManageOfficers /></ProtectedRoute>} />
                  <Route path="/vehicle-mgmt" element={<ProtectedRoute allowedRoles={["Admin"]}><VehicleRegistry /></ProtectedRoute>} />
                  <Route path="/unregistered-vehicles" element={<ProtectedRoute allowedRoles={["Admin"]}><UnregisteredVehicles /></ProtectedRoute>} />
                  <Route path="/violation-mgmt" element={<ProtectedRoute allowedRoles={["Admin"]}><ViolationManagement /></ProtectedRoute>} />
                  <Route path="/fines-mgmt" element={<ProtectedRoute allowedRoles={["Admin"]}><FineManagement /></ProtectedRoute>} />
                  <Route path="/financial-rules" element={<ProtectedRoute allowedRoles={["Admin"]}><TrafficRules /></ProtectedRoute>} />
                  <Route path="/complaints-mgmt" element={<ProtectedRoute allowedRoles={["Admin"]}><CitizenComplaints /></ProtectedRoute>} />
                  <Route path="/global-reports" element={<ProtectedRoute allowedRoles={["Admin"]}><GlobalReports /></ProtectedRoute>} />
                  <Route path="/notifications-mgmt" element={<ProtectedRoute allowedRoles={["Admin"]}><SystemNotifications /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute allowedRoles={["Admin"]}><AdminSettings /></ProtectedRoute>} />

                  {/* --- Police Specific Routes --- */}
                  <Route path="/police" element={<ProtectedRoute allowedRoles={["TrafficPolice"]}><PoliceOverview /></ProtectedRoute>} />
                  <Route path="/detect" element={<ProtectedRoute allowedRoles={["TrafficPolice"]}><AIScan /></ProtectedRoute>} />
                  <Route path="/manual-entry" element={<ProtectedRoute allowedRoles={["TrafficPolice"]}><ManualEntry /></ProtectedRoute>} />
                  <Route path="/manage" element={<ProtectedRoute allowedRoles={["TrafficPolice"]}><VerifyDesk /></ProtectedRoute>} />
                  <Route path="/records" element={<ProtectedRoute allowedRoles={["TrafficPolice"]}><ViolationRecords /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute allowedRoles={["TrafficPolice"]}><VehicleSearch /></ProtectedRoute>} />
                  <Route path="/evidence" element={<ProtectedRoute allowedRoles={["TrafficPolice"]}><EvidenceVault /></ProtectedRoute>} />

                  {/* --- Owner Specific Routes --- */}
                  <Route path="/owner" element={<ProtectedRoute allowedRoles={["VehicleOwner"]}><OwnerOverview /></ProtectedRoute>} />
                  <Route path="/violations" element={<ProtectedRoute allowedRoles={["VehicleOwner"]}><MyViolations /></ProtectedRoute>} />
                  <Route path="/gallery" element={<ProtectedRoute allowedRoles={["VehicleOwner"]}><MyPhotos /></ProtectedRoute>} />
                  <Route path="/payments" element={<ProtectedRoute allowedRoles={["VehicleOwner"]}><PaymentHistory /></ProtectedRoute>} />
                  <Route path="/vehicle" element={<ProtectedRoute allowedRoles={["VehicleOwner"]}><MyVehicles /></ProtectedRoute>} />
                  <Route path="/complaints" element={<ProtectedRoute allowedRoles={["VehicleOwner"]}><SendComplaint /></ProtectedRoute>} />

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </SocketProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
