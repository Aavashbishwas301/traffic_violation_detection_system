import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useLanguage } from "../../context/LanguageContext.jsx";
import Layout from "../../components/Layout.jsx";
import api from "../../utils/axios.js";
import { useToast } from "../../context/ToastContext.jsx";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  RefreshCw,
  ExternalLink,
  User,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Filter,
  Download,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/Card.jsx";
import { Badge } from "../../components/ui/Badge.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Input } from "../../components/ui/Input.jsx";

const UserVerifications = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({
    pendingTotal: 0,
    pendingPolice: 0,
    pendingOwners: 0,
    verifiedTotal: 0,
    rejectedTotal: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending, police, owner, verified, all
  const [searchTerm, setSearchTerm] = useState("");

  // Inspect Modal
  const [inspectUser, setInspectUser] = useState(null);

  // Reject Modal
  const [rejectUser, setRejectUser] = useState(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/admin/verifications");
      setUsers(data.users || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error("Fetch verifications failed:", err);
      addToast(lang === "np" ? "विवरण ल्याउन सकिएन।" : "Failed to load verifications.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchVerifications();
  }, [user]);

  const handleVerify = async (targetUser, action, remarks = "") => {
    setProcessingId(targetUser._id);
    try {
      await api.put(`/api/admin/verifications/${targetUser._id}`, {
        role: targetUser.role,
        action,
        remarks,
      });

      addToast(
        action === "approve"
          ? (lang === "np" ? `${targetUser.fullName} को खाता प्रमाणीकरण गरियो।` : `${targetUser.fullName} verified successfully.`)
          : (lang === "np" ? `${targetUser.fullName} को कागजात अस्वीकृत गरियो।` : `Verification rejected for ${targetUser.fullName}.`),
        action === "approve" ? "success" : "info"
      );

      // Close modals
      setRejectUser(null);
      setRejectionRemarks("");
      if (inspectUser?._id === targetUser._id) {
        setInspectUser(null);
      }

      fetchVerifications();
    } catch (err) {
      console.error("Verification update failed:", err);
      addToast(err.response?.data?.message || (lang === "np" ? "कार्य असफल भयो।" : "Action failed."), "error");
    } finally {
      setProcessingId(null);
    }
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    // Tab filter
    if (activeTab === "pending" && u.verificationStatus !== "Pending") return false;
    if (activeTab === "police" && u.role !== "TrafficPolice") return false;
    if (activeTab === "owner" && u.role !== "VehicleOwner") return false;
    if (activeTab === "verified" && u.verificationStatus !== "Verified") return false;

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.fullName?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber?.includes(q);
      const matchBadge = u.badgeNumber?.toLowerCase().includes(q);
      const matchCitizenship = u.citizenshipNumber?.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchBadge || matchCitizenship;
    }

    return true;
  });

  return (
    <Layout title={lang === "np" ? "कागजात प्रमाणीकरण डेस्क" : "User Verifications Desk"}>
      <div className="space-y-7 animate-fade-in pb-20">

        {/* --- HERO HEADER BANNER --- */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-800 bg-gradient-to-r from-[#071126] via-[#091736] to-[#12224D] text-white p-7 sm:p-9">
          <div className="absolute top-0 left-0 h-1.5 w-full flex">
            <div className="w-1/2 bg-[#DC143C]"></div>
            <div className="w-1/2 bg-[#003893]"></div>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-300">
                <ShieldCheck size={14} />
                <span>{lang === "np" ? "केन्द्रीय प्रमाणीकरण प्रणाली" : "National Verification Desk"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">
                {lang === "np" ? "नागरिक तथा अधिकृत कागजात प्रमाणीकरण" : "Identity Document Verification"}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-light">
                {lang === "np"
                  ? "दर्ता भएका ट्राफिक प्रहरी अधिकृत तथा सवारी धनी नागरिकहरूले पेश गरेको नागरिकता, प्रहरी परिचयपत्र तथा प्रमाणपत्र रुजु गरी प्रमाणीकरण गर्नुहोस्।"
                  : "Review submitted government credentials, citizenship cards, and police identification badges to verify accounts across Nepal's traffic network."}
              </p>
            </div>

            <Button
              onClick={fetchVerifications}
              variant="outline"
              size="sm"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 rounded-xl text-xs shrink-0"
            >
              <RefreshCw size={14} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
              {lang === "np" ? "ताजा गर्नुहोस्" : "Refresh Queue"}
            </Button>
          </div>
        </div>

        {/* --- STAT CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          <div 
            onClick={() => setActiveTab("pending")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "pending" 
                ? "bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/20" 
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase">
                {lang === "np" ? "समीक्षा बाँकी" : "Pending Total"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center font-bold text-xs">
                <Clock size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-amber-950 mt-2">{summary.pendingTotal}</p>
            <span className="text-[11px] text-amber-700 font-medium">
              {lang === "np" ? "रुजु हुन बाँकी खाता" : "Awaiting review"}
            </span>
          </div>

          <div 
            onClick={() => setActiveTab("police")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "police" 
                ? "bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-400/20" 
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase">
                {lang === "np" ? "प्रहरी अधिकृत" : "Police Pending"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-800 flex items-center justify-center font-bold text-xs">
                <ShieldAlert size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-blue-950 mt-2">{summary.pendingPolice}</p>
            <span className="text-[11px] text-blue-700 font-medium">
              {lang === "np" ? "ब्याज तथा परिचयपत्र" : "Badge credentials"}
            </span>
          </div>

          <div 
            onClick={() => setActiveTab("owner")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "owner" 
                ? "bg-purple-50 border-purple-400 shadow-md ring-2 ring-purple-400/20" 
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase">
                {lang === "np" ? "सवारी धनी" : "Owners Pending"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-800 flex items-center justify-center font-bold text-xs">
                <User size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-purple-950 mt-2">{summary.pendingOwners}</p>
            <span className="text-[11px] text-purple-700 font-medium">
              {lang === "np" ? "नागरिकता प्रमाणपत्र" : "Citizenship docs"}
            </span>
          </div>

          <div 
            onClick={() => setActiveTab("verified")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "verified" 
                ? "bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-400/20" 
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 uppercase">
                {lang === "np" ? "प्रमाणीकृत" : "Verified Total"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold text-xs">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-950 mt-2">{summary.verifiedTotal}</p>
            <span className="text-[11px] text-emerald-700 font-medium">
              {lang === "np" ? "स्वीकृत खाताहरू" : "Officially approved"}
            </span>
          </div>

          <div 
            onClick={() => setActiveTab("all")}
            className={`col-span-2 lg:col-span-1 p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === "all" 
                ? "bg-slate-100 border-slate-400 shadow-md ring-2 ring-slate-400/20" 
                : "bg-white border-slate-200/80 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase">
                {lang === "np" ? "कुल खाताहरू" : "All Enrolled"}
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                <Filter size={15} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{users.length}</p>
            <span className="text-[11px] text-slate-600 font-medium">
              {lang === "np" ? "सबै दर्ता रेकर्ड" : "All user records"}
            </span>
          </div>
        </div>

        {/* --- FILTER BAR & SEARCH --- */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          {/* Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
            {[
              { id: "pending", label: lang === "np" ? `प्रतीक्षारत (${summary.pendingTotal})` : `Pending (${summary.pendingTotal})` },
              { id: "police", label: lang === "np" ? "प्रहरी अधिकृत" : "Traffic Police" },
              { id: "owner", label: lang === "np" ? "सवारी धनी" : "Vehicle Owners" },
              { id: "verified", label: lang === "np" ? `प्रमाणीकृत (${summary.verifiedTotal})` : `Verified (${summary.verifiedTotal})` },
              { id: "all", label: lang === "np" ? "सबै" : "All Users" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              type="text"
              placeholder={lang === "np" ? "नाम, इमेल, ब्याज वा नागरिकता नं..." : "Search name, badge, citizenship..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl border-slate-200 focus:border-[#003893]"
            />
          </div>
        </div>

        {/* --- MAIN VERIFICATIONS TABLE --- */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-3">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#003893] rounded-full animate-spin"></div>
              <p className="text-xs text-slate-500 font-medium">
                {lang === "np" ? "कागजात प्रमाणीकरण सूची लोड हुँदैछ..." : "Loading verification requests..."}
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-800">
                {lang === "np" ? "कुनै पनि रेकर्ड फेला परेन" : "No Verification Records Found"}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {lang === "np" 
                  ? "छनोट गरिएको फिल्टर अनुसार कुनै प्रयोगकर्ता कागजात बाँकी छैन।" 
                  : "There are currently no user requests matching your selected filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-4 px-6">{lang === "np" ? "प्रयोगकर्ता / अधिकृत" : "User / Officer"}</th>
                    <th className="py-4 px-4">{lang === "np" ? "भूमिका / पद" : "Role / Rank"}</th>
                    <th className="py-4 px-4">{lang === "np" ? "पहिचान नम्बर" : "Identity Number"}</th>
                    <th className="py-4 px-4">{lang === "np" ? "पेश गरिएको कागजात" : "Submitted Document"}</th>
                    <th className="py-4 px-4">{lang === "np" ? "प्रमाणीकरण अवस्था" : "Status"}</th>
                    <th className="py-4 px-6 text-right">{lang === "np" ? "कार्यहरू" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => {
                    const isPolice = u.role === "TrafficPolice";
                    const hasDoc = !!u.verificationDocument;
                    const docUrl = hasDoc 
                      ? (u.verificationDocument.startsWith("http") ? u.verificationDocument : `http://localhost:5000${u.verificationDocument}`)
                      : null;

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* User Details */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3.5">
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-sm shrink-0 ${
                              isPolice 
                                ? "bg-blue-100 text-[#003893]" 
                                : "bg-purple-100 text-purple-900"
                            }`}>
                              {u.fullName?.charAt(0) || (isPolice ? "P" : "O")}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{u.fullName}</p>
                              <div className="flex items-center space-x-2 text-slate-500 text-[11px] mt-0.5">
                                <span className="flex items-center space-x-1">
                                  <Mail size={12} className="opacity-70" />
                                  <span>{u.email}</span>
                                </span>
                                {u.phoneNumber && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1 font-mono">
                                      <Phone size={12} className="opacity-70" />
                                      <span>{u.phoneNumber}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role / Rank */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <Badge variant={isPolice ? "default" : "secondary"} className="text-[10px] font-bold">
                              {isPolice 
                                ? (lang === "np" ? "ट्राफिक प्रहरी" : "Traffic Police")
                                : (lang === "np" ? "सवारी धनी" : "Vehicle Owner")}
                            </Badge>
                            {isPolice && (
                              <p className="text-[11px] text-slate-500 font-medium">
                                {u.rank || u.station || "Traffic Officer"}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Identity Number */}
                        <td className="py-4 px-4">
                          {isPolice ? (
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                {lang === "np" ? "ब्याज नम्बर" : "Badge Number"}
                              </span>
                              <span className="font-mono font-bold text-slate-800 text-xs">
                                {u.badgeNumber || "N/A"}
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                                {lang === "np" ? "नागरिकता नम्बर" : "Citizenship No"}
                              </span>
                              <span className="font-mono font-bold text-slate-800 text-xs">
                                {u.citizenshipNumber || "N/A"}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Submitted Document */}
                        <td className="py-4 px-4">
                          {hasDoc ? (
                            <button
                              onClick={() => setInspectUser(u)}
                              className="group flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-[#003893]/40 transition-all text-left"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-200 shrink-0 border border-slate-300 relative">
                                <img
                                  src={docUrl}
                                  alt="Doc preview"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Eye size={14} className="text-white" />
                                </div>
                              </div>
                              <div>
                                <span className="font-bold text-[11px] text-slate-900 group-hover:text-[#003893] block">
                                  {isPolice 
                                    ? (lang === "np" ? "प्रहरी परिचयपत्र" : "Police ID")
                                    : (lang === "np" ? "नागरिकता कार्ड" : "Citizenship Card")}
                                </span>
                                <span className="text-[10px] text-slate-500 inline-flex items-center space-x-1">
                                  <span>{lang === "np" ? "हेर्नुहोस्" : "Click to view"}</span>
                                  <ExternalLink size={10} />
                                </span>
                              </div>
                            </button>
                          ) : (
                            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                              <AlertCircle size={12} className="text-amber-600 shrink-0" />
                              <span>{lang === "np" ? "अपलोड बाँकी" : "Not uploaded yet"}</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          {u.verificationStatus === "Verified" ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                              <span>{lang === "np" ? "प्रमाणीकृत" : "Verified"}</span>
                            </span>
                          ) : u.verificationStatus === "Rejected" ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                              <XCircle size={13} className="text-rose-600 shrink-0" />
                              <span>{lang === "np" ? "अस्वीकृत" : "Rejected"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
                              <Clock size={13} className="text-amber-600 shrink-0" />
                              <span>{lang === "np" ? "प्रतीक्षारत" : "Pending"}</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center space-x-2">
                            {hasDoc && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setInspectUser(u)}
                                className="h-8 px-2.5 text-xs text-slate-600 hover:text-[#003893]"
                                title={lang === "np" ? "कागजात हेर्नुहोस्" : "Inspect Document"}
                              >
                                <Eye size={15} className="mr-1" />
                                <span className="hidden sm:inline">{lang === "np" ? "हेर्नुहोस्" : "View"}</span>
                              </Button>
                            )}

                            {u.verificationStatus !== "Verified" && (
                              <Button
                                size="sm"
                                disabled={processingId === u._id}
                                onClick={() => handleVerify(u, "approve")}
                                className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                              >
                                <CheckCircle2 size={14} className="mr-1.5" />
                                {lang === "np" ? "स्वीकृत" : "Approve"}
                              </Button>
                            )}

                            {u.verificationStatus !== "Rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={processingId === u._id}
                                onClick={() => {
                                  setRejectUser(u);
                                  setRejectionRemarks(u.verificationRemarks || "");
                                }}
                                className="h-8 px-3 border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl"
                              >
                                <XCircle size={14} className="mr-1.5" />
                                {lang === "np" ? "अस्वीकृत" : "Reject"}
                              </Button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL 1: INSPECT DOCUMENT LIGHTBOX --- */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/75">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#003893] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {inspectUser.role === "TrafficPolice" 
                      ? (lang === "np" ? "प्रहरी परिचयपत्र प्रमाणीकरण" : "Police Identification Verification")
                      : (lang === "np" ? "नागरिकता प्रमाणपत्र प्रमाणीकरण" : "Citizenship Document Verification")}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inspectUser.fullName} ({inspectUser.email})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setInspectUser(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Document Display (Left / 7 cols) */}
              <div className="md:col-span-8 flex flex-col items-center justify-center bg-slate-900 rounded-2xl p-4 overflow-hidden min-h-[340px]">
                {inspectUser.verificationDocument ? (
                  <img
                    src={
                      inspectUser.verificationDocument.startsWith("http")
                        ? inspectUser.verificationDocument
                        : `http://localhost:5000${inspectUser.verificationDocument}`
                    }
                    alt="Document"
                    className="max-h-[500px] w-auto max-w-full object-contain rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="text-center text-slate-400 space-y-2">
                    <FileText size={40} className="mx-auto opacity-50" />
                    <p className="text-xs">{lang === "np" ? "कुनै कागजात पेश गरिएको छैन" : "No document file uploaded"}</p>
                  </div>
                )}
              </div>

              {/* User Metadata Card (Right / 5 cols) */}
              <div className="md:col-span-4 space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {lang === "np" ? "पूरा नाम" : "Full Legal Name"}
                    </span>
                    <p className="text-base font-bold text-slate-900">{inspectUser.fullName}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {inspectUser.role === "TrafficPolice" 
                        ? (lang === "np" ? "प्रहरी ब्याज नम्बर" : "Police Badge ID")
                        : (lang === "np" ? "नागरिकता नम्बर" : "Citizenship Number")}
                    </span>
                    <p className="font-mono text-sm font-bold text-[#003893] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-max">
                      {inspectUser.badgeNumber || inspectUser.citizenshipNumber || "N/A"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {lang === "np" ? "सम्पर्क नम्बर" : "Phone"}
                      </span>
                      <p className="font-semibold text-slate-800">{inspectUser.phoneNumber || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {lang === "np" ? "अवस्था" : "Current Status"}
                      </span>
                      <Badge variant={inspectUser.verificationStatus === "Verified" ? "success" : "warning"} className="mt-0.5">
                        {inspectUser.verificationStatus || "Pending"}
                      </Badge>
                    </div>
                  </div>

                  {inspectUser.verificationRemarks && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">
                        {lang === "np" ? "हालको टिप्पणी" : "Current Remarks"}
                      </span>
                      <p className="text-slate-700 italic mt-0.5">{inspectUser.verificationRemarks}</p>
                    </div>
                  )}
                </div>

                {/* Inline Action Buttons */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <Button
                    onClick={() => handleVerify(inspectUser, "approve")}
                    disabled={processingId === inspectUser._id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl shadow-md"
                  >
                    <CheckCircle2 size={16} className="mr-2" />
                    {lang === "np" ? "कागजात स्वीकृत गर्नुहोस् (Approve)" : "Approve & Verify Account"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectUser(inspectUser);
                      setRejectionRemarks(inspectUser.verificationRemarks || "");
                    }}
                    disabled={processingId === inspectUser._id}
                    className="w-full border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs h-10 rounded-xl"
                  >
                    <XCircle size={16} className="mr-2" />
                    {lang === "np" ? "अस्वीकृत गर्नुहोस् (Reject with remarks)" : "Reject Document"}
                  </Button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2: REJECT REASON MODAL --- */}
      {rejectUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {lang === "np" ? "कागजात अस्वीकृत गर्नुहोस्" : "Reject Document"}
                </h3>
                <p className="text-xs text-slate-500">
                  {rejectUser.fullName} ({rejectUser.role})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === "np"
                ? "कृपया प्रयोगकर्तालाई कागजात अस्वीकृत हुनुको कारण खुलाउनुहोस् ताकि उनीहरूले सच्याएर पुनः अपलोड गर्न सकून्।"
                : "Please explain why the document was rejected so the user can re-upload an appropriate copy."}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {lang === "np" ? "अस्वीकृतिको कारण / टिप्पणी *" : "Rejection Reason / Remarks *"}
              </label>
              <textarea
                rows={3}
                required
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder={
                  lang === "np"
                    ? "उदा: नागरिकताको फोटो धमिलो छ वा विवरण पढ्न सकिएन। कृपया स्पष्ट फोटो खिचेर पुनः अपलोड गर्नुहोस्।"
                    : "e.g. Document image is blurry and illegible. Please take a clear photo in good lighting and re-upload."
                }
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setRejectUser(null)}
                className="flex-1 text-xs rounded-xl h-10"
              >
                {lang === "np" ? "रद्द गर्नुहोस्" : "Cancel"}
              </Button>
              <Button
                onClick={() => handleVerify(rejectUser, "reject", rejectionRemarks)}
                disabled={processingId === rejectUser._id}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl h-10 shadow-sm"
              >
                {lang === "np" ? "अस्वीकृत पठाउनुहोस्" : "Submit Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default UserVerifications;
