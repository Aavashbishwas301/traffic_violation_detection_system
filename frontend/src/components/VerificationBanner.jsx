import React, { useState, useRef } from "react";
import { useLanguage } from "../context/LanguageContext.jsx";
import api from "../utils/axios.js";
import { useToast } from "../context/ToastContext.jsx";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Loader2, 
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { Button } from "./ui/Button.jsx";

const VerificationBanner = ({ user, onUploadSuccess }) => {
  const { lang } = useLanguage();
  const { addToast } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const fileInputRef = useRef(null);

  if (!user || user.role === "Admin") {
    return null;
  }

  const isPolice = user.role === "TrafficPolice";
  const docTypeLabel = isPolice
    ? (lang === "np" ? "नेपाल प्रहरी परिचयपत्र / ब्याज कागजात" : "Nepal Police ID Card / Officer Badge Proof")
    : (lang === "np" ? "नागरिकताको प्रमाणपत्र / राष्ट्रिय परिचयपत्र" : "Citizenship Certificate / National ID");

  const status = user.verificationStatus || "Pending";
  const hasDocument = !!user.verificationDocument;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Check size (max 10MB)
    if (selected.size > 10 * 1024 * 1024) {
      addToast(lang === "np" ? "कागजात १० MB भन्दा सानो हुनुपर्छ।" : "File size must be under 10MB.", "error");
      return;
    }

    // Check type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!validTypes.includes(selected.type)) {
      addToast(lang === "np" ? "कृपया JPG, PNG वा PDF फाइल मात्र छनोट गर्नुहोस्।" : "Please select a JPG, PNG, or PDF file.", "error");
      return;
    }

    setFile(selected);
    if (selected.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async (e) => {
    e?.preventDefault();
    if (!file) {
      addToast(lang === "np" ? "कृपया पहिले कागजात फाइल छनोट गर्नुहोस्।" : "Please select a document file first.", "warning");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("document", file);

      const { data } = await api.post("/api/users/upload-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      addToast(
        lang === "np" 
          ? "कागजात सफलतापूर्वक पेश गरियो। प्रशासकको समीक्षाको प्रतीक्षामा छ।" 
          : "Document uploaded successfully and queued for admin verification.", 
        "success"
      );
      
      setFile(null);
      setPreview(null);
      setIsReplacing(false);
      
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      console.error("Document upload failed:", err);
      addToast(
        err.response?.data?.message || 
        (lang === "np" ? "कागजात अपलोड गर्न सकिएन। पुनः प्रयास गर्नुहोस्।" : "Failed to upload document. Please try again."),
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  // 1. VERIFIED STATE
  if (status === "Verified") {
    return (
      <div className="rounded-2xl p-4 bg-emerald-50/80 border border-emerald-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-emerald-900">
                {lang === "np" ? "प्रमाणीकृत खाता (Verified Account)" : "Verified Account Status"}
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-200/80 text-emerald-800 rounded-full">
                {lang === "np" ? "सक्रिय" : "Active"}
              </span>
            </div>
            <p className="text-xs text-emerald-700/90 mt-0.5">
              {isPolice 
                ? (lang === "np" ? `प्रहरी अधिकृत ब्याज नं: ${user.badgeNumber || "प्रमाणित"} • केन्द्रीय प्रणालीमा आबद्ध` : `Badge ID: ${user.badgeNumber || "Verified"} • Full Grid Privileges Enabled`)
                : (lang === "np" ? `नागरिकता नं: ${user.citizenshipNumber || "प्रमाणित"} • सम्पूर्ण डिजिटल सेवाहरू उपलब्ध` : `Citizenship: ${user.citizenshipNumber || "Verified"} • Verified Citizen Account`)}
            </p>
          </div>
        </div>

        {user.verificationDocument && (
          <a
            href={user.verificationDocument.startsWith("http") ? user.verificationDocument : `http://localhost:5000${user.verificationDocument}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white text-xs font-semibold text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200 transition-colors shrink-0"
          >
            <Eye size={14} />
            <span>{lang === "np" ? "कागजात हेर्नुहोस्" : "View Document"}</span>
            <ExternalLink size={12} className="opacity-60" />
          </a>
        )}
      </div>
    );
  }

  // 2. REJECTED STATE
  if (status === "Rejected") {
    return (
      <div className="rounded-3xl p-6 bg-gradient-to-br from-rose-50 via-white to-rose-50/50 border-2 border-rose-300 shadow-md animate-fade-in text-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-200 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <AlertCircle size={26} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-rose-900">
                  {lang === "np" ? "कागजात प्रमाणीकरण अस्वीकृत (Verification Rejected)" : "Document Verification Rejected"}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-200 text-rose-800 rounded-md uppercase">
                  {lang === "np" ? "अस्वीकृत" : "Rejected"}
                </span>
              </div>
              <p className="text-xs text-rose-700 font-medium mt-0.5">
                {lang === "np" 
                  ? "प्रशासकले तपाईँले पेश गर्नुभएको कागजात अस्वीकृत गर्नुभएको छ। कृपया कारण पढेर नयाँ कागजात अपलोड गर्नुहोस्।" 
                  : "Administration rejected your submitted document. Please review the feedback remarks below and re-upload."}
              </p>
            </div>
          </div>
        </div>

        {/* Remarks Box */}
        <div className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-200 text-xs text-rose-900 space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-rose-800 block">
            {lang === "np" ? "प्रशासकको टिप्पणी (Administrator Remarks):" : "Administrator Remarks:"}
          </span>
          <p className="font-medium italic">
            "{user.verificationRemarks || (lang === "np" ? "कागजात स्पष्ट नभएकोले कृपया पुनः नयाँ फोटो वा स्क्यान अपलोड गर्नुहोस्।" : "The uploaded document was not clearly readable. Please re-upload a clear copy.")}"
          </p>
        </div>

        {/* Re-upload Form */}
        <form onSubmit={handleUpload} className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              className="hidden"
              id="doc-reupload-input"
            />
            <label
              htmlFor="doc-reupload-input"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-rose-400 bg-white hover:bg-rose-50 text-xs font-semibold text-rose-800 cursor-pointer flex items-center justify-center space-x-2 transition-colors"
            >
              <UploadCloud size={16} />
              <span>{file ? file.name : (lang === "np" ? `नयाँ ${docTypeLabel} छनोट गर्नुहोस्` : `Select New ${docTypeLabel}`)}</span>
            </label>

            <Button
              type="submit"
              disabled={!file || uploading}
              className="w-full sm:w-auto bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin mr-2" />
                  {lang === "np" ? "अपलोड हुँदैछ..." : "Uploading..."}
                </>
              ) : (
                lang === "np" ? "नयाँ कागजात पेश गर्नुहोस्" : "Submit Re-upload"
              )}
            </Button>
          </div>

          {preview && (
            <div className="flex items-center space-x-3 p-2 rounded-xl bg-white border border-rose-200 w-max">
              <img src={preview} alt="New Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
              <div className="text-xs">
                <p className="font-bold text-slate-800 truncate max-w-[200px]">{file.name}</p>
                <p className="text-[10px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
          )}
        </form>
      </div>
    );
  }

  // 3. PENDING WITH DOCUMENT ALREADY UPLOADED (Under Review)
  if (hasDocument && !isReplacing) {
    const docUrl = user.verificationDocument.startsWith("http") 
      ? user.verificationDocument 
      : `http://localhost:5000${user.verificationDocument}`;

    return (
      <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-50/90 via-blue-50/50 to-amber-50/60 border border-amber-300/80 shadow-md animate-fade-in text-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Clock size={26} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-amber-950">
                  {lang === "np" ? "कागजात प्रशासकको समीक्षामा छ" : "Document Under Administrator Review"}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-md uppercase">
                  {lang === "np" ? "प्रतीक्षारत" : "Pending"}
                </span>
              </div>
              <p className="text-xs text-amber-800 font-medium mt-0.5">
                {lang === "np" 
                  ? "तपाईँले पेश गर्नुभएको कागजात हाल केन्द्रीय ट्राफिक निर्देशनालय / प्रशासकद्वारा रुजु भइरहेको छ।" 
                  : "Your submitted credentials are queued for official review by administration."}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white text-xs font-bold text-slate-700 hover:text-[#003893] border border-slate-200 shadow-sm transition-colors"
            >
              <Eye size={14} />
              <span>{lang === "np" ? "पेश गरिएको कागजात हेर्नुहोस्" : "Preview Document"}</span>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReplacing(true)}
              className="text-xs font-semibold rounded-xl border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              <RefreshCw size={14} className="mr-1.5" />
              {lang === "np" ? "परिवर्तन गर्नुहोस्" : "Replace"}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>
              {isPolice 
                ? (lang === "np" ? `प्रहरी ब्याज: ${user.badgeNumber || "दर्ता गरिएको"} • कागजात सुरक्षित रूपमा सुरक्षित छ` : `Badge ID: ${user.badgeNumber || "Enrolled"} • Document safely vaulted`)
                : (lang === "np" ? `नागरिकता: ${user.citizenshipNumber || "दर्ता गरिएको"} • कागजात सुरक्षित रूपमा सुरक्षित छ` : `Citizenship: ${user.citizenshipNumber || "Enrolled"} • Document safely vaulted`)}
            </span>
          </span>
          <span className="text-[11px] font-mono text-amber-700 font-semibold">
            {lang === "np" ? "प्रमाणीकरणपछि पूर्ण अधिकार सक्रिय हुनेछ" : "Full access unlocked upon approval"}
          </span>
        </div>
      </div>
    );
  }

  // 4. COMPULSORY UPLOAD REQUIRED STATE (No document yet, or replacing)
  return (
    <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-amber-50 via-white to-amber-50/60 border-2 border-amber-300/90 shadow-lg animate-fade-in text-slate-900 space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-200 pb-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#DC143C] text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert size={26} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-black text-slate-950">
                {lang === "np" ? "अनिवार्य कागजात प्रमाणीकरण बाँकी" : "Compulsory Identity Verification Required"}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#DC143C] text-white rounded-md uppercase tracking-wider">
                {lang === "np" ? "अनिवार्य" : "Mandatory"}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              {isPolice 
                ? (lang === "np" 
                    ? "ट्राफिक प्रहरी ड्युटी, AI स्क्यान क्यामेरा ग्रिड तथा चलान प्रमाणीकरणका लागि आफ्नो आधिकारिक नेपाल प्रहरी परिचयपत्र वा नियुक्ति पत्र अनिवार्य रूपमा अपलोड गर्नुहोस्।" 
                    : "To verify your officer credentials and unlock AI scan & manual citation enforcement, upload your official Nepal Police ID card.")
                : (lang === "np"
                    ? "सवारी तथा यातायात व्यवस्था ऐन अनुसार सवारी दर्ता, ई-चलान अभिलेख र पूर्ण नागरिक अधिकारका लागि आफ्नो आधिकारिक नागरिकता प्रमाणपत्र अपलोड गर्नुहोस्।"
                    : "Under transport regulations, please upload a clear copy of your Citizenship Certificate or National ID to verify your citizen profile.")}
            </p>
          </div>
        </div>

        {isReplacing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsReplacing(false);
              setFile(null);
              setPreview(null);
            }}
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            {lang === "np" ? "रद्द गर्नुहोस्" : "Cancel"}
          </Button>
        )}
      </div>

      {/* Upload Dropzone Form */}
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/jpg,application/pdf"
          className="hidden"
          id="doc-upload-input"
        />

        {!file ? (
          <label
            htmlFor="doc-upload-input"
            className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-400/80 rounded-2xl bg-amber-50/40 hover:bg-amber-100/60 cursor-pointer transition-all hover:border-[#003893]"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-200/60 text-amber-900 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-[#003893] group-hover:text-white transition-all shadow-sm">
              <UploadCloud size={24} />
            </div>
            <span className="text-sm font-bold text-slate-800 group-hover:text-[#003893] transition-colors">
              {lang === "np" ? `यहाँ क्लिक गरी ${docTypeLabel} छनोट गर्नुहोस्` : `Click to Upload ${docTypeLabel}`}
            </span>
            <span className="text-xs text-slate-500 mt-1">
              {lang === "np" ? "समर्थित ढाँचा: JPG, PNG, PDF (अधिकतम १० MB)" : "Supported formats: JPG, PNG, PDF (Max 10MB)"}
            </span>
          </label>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-sm gap-4">
            <div className="flex items-center space-x-3.5">
              {preview ? (
                <img src={preview} alt="Selected Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-sm shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <FileText size={28} />
                </div>
              )}
              <div>
                <p className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[280px]">
                  {file.name}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type || "Document"}
                </p>
                <label 
                  htmlFor="doc-upload-input" 
                  className="text-[11px] font-bold text-[#003893] hover:underline cursor-pointer inline-block mt-1"
                >
                  {lang === "np" ? "अर्को फाइल रोज्नुहोस्" : "Change selected file"}
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={uploading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-slate-900 via-[#003893] to-slate-900 hover:from-slate-950 hover:to-[#00286b] text-white font-bold text-xs rounded-xl shadow-md transition-all h-11"
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  {lang === "np" ? "अपलोड हुँदैछ..." : "Submitting..."}
                </>
              ) : (
                lang === "np" ? "प्रशासक समक्ष पेश गर्नुहोस्" : "Submit for Admin Review"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default VerificationBanner;
