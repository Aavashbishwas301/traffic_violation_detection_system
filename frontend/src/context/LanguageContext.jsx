import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(undefined);

export const translations = {
  np: {
    // Navigation / Sidebar
    nav_dashboard: 'ड्यासबोर्ड',
    nav_verifications: 'कागजात प्रमाणीकरण डेस्क',
    nav_manage_police: 'प्रहरी अधिकारी व्यवस्थापन',
    nav_vehicle_registry: 'सवारी दर्ता अभिलेख',
    nav_camera_zones: 'क्यामेरा तथा क्षेत्र क्यालिब्रेसन',
    nav_ai_scan: 'स्वचालित AI स्क्यान',
    nav_manual_entry: 'म्यानुअल चलान प्रविष्टि',
    nav_violation_mgmt: 'उल्लङ्घन व्यवस्थापन',
    nav_fine_mgmt: 'जरिवाना व्यवस्थापन',
    nav_traffic_rules: 'ट्राफिक नियम अनुसूची',
    nav_citizen_complaints: 'नागरिक गुनासो तथा उजुरी',
    nav_reports_analytics: 'प्रतिवेदन तथा तथ्याङ्क',
    nav_notifications: 'सूचना तथा सन्देश',
    nav_officer_alerts: 'अधिकारी सतर्कता सन्देश',
    nav_profile_mgmt: 'प्रोफाइल व्यवस्थापन',
    nav_verify_desk: 'प्रमाणीकरण डेस्क',
    nav_evidence_photos: 'फोटो प्रमाण भण्डार',
    nav_search_vehicle: 'सवारी खोजी',
    nav_violation_records: 'उल्लङ्घन अभिलेख',
    nav_my_violations: 'मेरो उल्लङ्घनहरू',
    nav_my_photos: 'प्रमाण फोटोहरू',
    nav_payment_history: 'भुक्तानी इतिहास',
    nav_my_vehicles: 'मेरो सवारी साधन',
    nav_send_complaint: 'उजुरी / गुनासो दर्ता',
    nav_my_profile: 'मेरो प्रोफाइल',
    nav_logout: 'लगआउट',

    // Layout Header & Statuses
    system_healthy: 'प्रणाली सक्रिय',
    traffic_system: 'ट्राफिक व्यवस्थापन प्रणाली',
    portal_citizen: 'नागरिक पोर्टल',
    portal_police: 'कार्यस्थल ड्युटी स्टेशन',
    portal_admin: 'केन्द्रीय नियन्त्रण कक्ष',
    welcome_back: 'स्वागत छ',
    lang_toggle_label: 'भाषा छनोट',

    // Common Actions & Badges
    action_view: 'हेर्नुहोस्',
    action_search: 'खोजी गर्नुहोस्',
    action_filter: 'फिल्टर',
    action_pay: 'भुक्तानी गर्नुहोस्',
    action_download: 'डाउनलोड',
    action_submit: 'पेश गर्नुहोस्',
    action_cancel: 'रद्द गर्नुहोस्',
    action_back: 'पछाडि जानुहोस्',
    action_details: 'विवरण',

    // Statuses
    status_paid: 'फर्स्यौट भएको (Paid)',
    status_unpaid: 'बाँकी (Unpaid)',
    status_pending: 'प्रतीक्षारत (Pending)',
    status_verified: 'प्रमाणित (Verified)',
    status_rejected: 'अस्वीकृत (Rejected)',
    status_in_review: 'पुनरावलोकनमा (In Review)',

    // Citizen Dashboard (Owner)
    owner_banner_tag: 'नागरिक खाता सक्रिय',
    owner_total_fines: 'कुल भुक्तानी गर्न बाँकी रकम',
    owner_unpaid_count: 'बाँकी ई-चलान सङ्ख्या',
    owner_vehicles_count: 'दर्ता भएका सवारी साधन',
    owner_quick_pay: 'तुरुन्त जरिवाना तिर्नुहोस्',
    owner_recent_violations: 'हालैका ट्राफिक नियम उल्लङ्घनहरू',
    owner_no_violations: 'तपाईंको कुनै पनि उल्लङ्घन अभिलेख भेटिएन। सुरक्षित यात्राका लागि धन्यवाद!',
    owner_vehicle_status: 'सवारी साधनको विवरण',

    // Police Dashboard
    police_banner_tag: 'ट्राफिक ड्युटी सक्रिय',
    police_todays_catch: 'आज पत्ता लागेका उल्लङ्घन',
    police_manual_entries: 'म्यानुअल दर्ता',
    police_pending_review: 'पुनरावलोकन हुन बाँकी',
    police_fines_issued: 'कुल जारी जरिवाना',
    police_start_ai_scan: 'AI क्यामेरा स्क्यान सुरु गर्नुहोस्',
    police_new_manual: 'नयाँ म्यानुअल चलान थप्नुहोस्',
    police_recent_detections: 'हालै पत्ता लागेका सवारी साधनहरू',

    // Admin Dashboard
    admin_banner_tag: 'केन्द्रीय प्रणाली प्रशासक',
    admin_total_officers: 'सक्रिय ट्राफिक प्रहरी',
    admin_total_vehicles: 'दर्ता भएका सवारी',
    admin_active_cameras: 'सक्रिय AI क्यामेरा ग्रिड',
    admin_total_revenue: 'कुल संकलित जरिवाना',
    admin_system_overview: 'राष्ट्रिय ट्राफिक अनुगमन सारांश',
  },
  en: {
    // Navigation / Sidebar
    nav_dashboard: 'Dashboard',
    nav_verifications: 'User Verifications',
    nav_manage_police: 'Manage Police',
    nav_vehicle_registry: 'Vehicle Registry',
    nav_camera_zones: 'Camera & Zones',
    nav_ai_scan: 'AI Scan',
    nav_manual_entry: 'Manual Entry',
    nav_violation_mgmt: 'Violation Management',
    nav_fine_mgmt: 'Fine Management',
    nav_traffic_rules: 'Traffic Rules',
    nav_citizen_complaints: 'Citizen Complaints',
    nav_reports_analytics: 'Reports & Analytics',
    nav_notifications: 'Notifications',
    nav_officer_alerts: 'Officer Alerts',
    nav_profile_mgmt: 'Profile Management',
    nav_verify_desk: 'Verify Desk',
    nav_evidence_photos: 'Evidence Photos',
    nav_search_vehicle: 'Search Vehicle',
    nav_violation_records: 'Violation Records',
    nav_my_violations: 'My Violations',
    nav_my_photos: 'My Photos',
    nav_payment_history: 'Payment History',
    nav_my_vehicles: 'My Vehicles',
    nav_send_complaint: 'Send Complaint',
    nav_my_profile: 'My Profile',
    nav_logout: 'Logout',

    // Layout Header & Statuses
    system_healthy: 'System Healthy',
    traffic_system: 'Traffic Violation Detection System',
    portal_citizen: 'Citizen Portal',
    portal_police: 'Duty Station',
    portal_admin: 'Admin Command Center',
    welcome_back: 'Welcome back',
    lang_toggle_label: 'Select Language',

    // Common Actions & Badges
    action_view: 'View',
    action_search: 'Search',
    action_filter: 'Filter',
    action_pay: 'Pay Now',
    action_download: 'Download',
    action_submit: 'Submit',
    action_cancel: 'Cancel',
    action_back: 'Back',
    action_details: 'Details',

    // Statuses
    status_paid: 'Paid',
    status_unpaid: 'Unpaid',
    status_pending: 'Pending',
    status_verified: 'Verified',
    status_rejected: 'Rejected',
    status_in_review: 'In Review',

    // Citizen Dashboard (Owner)
    owner_banner_tag: 'Citizen Node Active',
    owner_total_fines: 'Total Outstanding Fines',
    owner_unpaid_count: 'Unpaid Citations',
    owner_vehicles_count: 'Registered Vehicles',
    owner_quick_pay: 'Pay All Fines Instantly',
    owner_recent_violations: 'Recent Traffic Citations',
    owner_no_violations: 'No traffic violations recorded against your profile. Safe driving!',
    owner_vehicle_status: 'Registered Vehicle Compliance',

    // Police Dashboard
    police_banner_tag: 'Traffic Duty Active',
    police_todays_catch: "Today's Catch",
    police_manual_entries: 'Manual Entries',
    police_pending_review: 'Pending Review',
    police_fines_issued: 'Fines Issued',
    police_start_ai_scan: 'Launch AI Radar Scan',
    police_new_manual: 'Create Manual Citation',
    police_recent_detections: 'Recent Real-time Detections',

    // Admin Dashboard
    admin_banner_tag: 'Central System Administrator',
    admin_total_officers: 'Active Police Officers',
    admin_total_vehicles: 'Registered Vehicles',
    admin_active_cameras: 'Active AI Surveillance Grid',
    admin_total_revenue: 'Total Revenue Collected',
    admin_system_overview: 'National Traffic Surveillance Overview',
  }
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('tvds_app_lang');
      return saved === 'en' || saved === 'np' ? saved : 'np';
    } catch {
      return 'np';
    }
  });

  const handleSetLang = (newLang) => {
    if (newLang === 'en' || newLang === 'np') {
      setLang(newLang);
      try {
        localStorage.setItem('tvds_app_lang', newLang);
      } catch (err) {
        console.warn('Could not save language preference:', err);
      }
    }
  };

  const toggleLang = () => {
    handleSetLang(lang === 'np' ? 'en' : 'np');
  };

  const t = translations[lang] || translations.np;

  const tText = (npText, enText) => (lang === 'np' ? npText : enText);

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, toggleLang, t, tText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
