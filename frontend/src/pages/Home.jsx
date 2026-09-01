import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, Camera, UserCheck, 
  MapPin, Mail, Phone, Menu, X, ArrowRight, FileText,
  Search, CheckCircle2, Cpu, AlertTriangle,
  ChevronRight, Lock, HelpCircle, ExternalLink, Activity,
  CreditCard, FileCheck, Info, Scale, Bell, Clock, Building2, Eye, Globe
} from 'lucide-react';
import policeLogo from '../assets/police_logo.jpg';

const Home = () => {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('tvds_app_lang');
    return saved === 'en' || saved === 'np' ? saved : 'np';
  });

  const handleSetLang = (newLang) => {
    setLang(newLang);
    try {
      localStorage.setItem('tvds_app_lang', newLang);
    } catch (err) {
      console.warn('Could not save language preference:', err);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTab, setSearchTab] = useState('plate');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const locale = lang === 'np' ? 'ne-NP' : 'en-US';
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleDateString(locale, options));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [lang]);

  const handleSearchCitation = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/login?search=${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
    } else {
      navigate('/login');
    }
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
      setMobileMenuOpen(false);
    }
  };

  // Translations dictionary
  const t = {
    top_gov: lang === 'np' ? 'नेपाल सरकार' : 'Government of Nepal',
    top_ministry: lang === 'np' ? 'भौतिक पूर्वाधार तथा यातायात मन्त्रालय' : 'Ministry of Physical Infrastructure and Transport',
    hotline: lang === 'np' ? 'हटलाइन: १०३ (निःशुल्क)' : 'Hotline: 103 (Toll Free)',
    police_division: lang === 'np' ? 'नेपाल प्रहरी, उपत्यका ट्राफिक प्रहरी महाशाखा / यातायात व्यवस्था विभाग' : 'Nepal Police, Valley Traffic Police Division / Department of Transport Management (DoTM)',
    system_title: lang === 'np' ? 'ट्राफिक नियम उल्लङ्घन पहिचान तथा व्यवस्थापन प्रणाली' : 'Traffic Violation Detection System (TVDS)',
    system_sub: lang === 'np' ? 'स्वचालित ट्राफिक ई-चलान तथा नियमन प्रणाली' : 'Automated Traffic Enforcement & Digital Citation Portal',
    live_badge: lang === 'np' ? 'सञ्चालनमा छ • Live Grid' : 'Operational • Live AI Grid',
    control_room: lang === 'np' ? 'नियन्त्रण कक्ष: २४/७ सक्रिय' : 'Command Center: 24/7 Active',
    central_control: lang === 'np' ? 'केन्द्रीय ट्राफिक कन्ट्रोल रुम' : 'Central Traffic Surveillance Room',
    
    // Navigation
    nav_home: lang === 'np' ? 'गृहपृष्ठ' : 'Home',
    nav_search: lang === 'np' ? 'ई-चलान खोज्नुहोस्' : 'Check Citation',
    nav_rules: lang === 'np' ? 'नियम तथा जरिवाना' : 'Rules & Fines',
    nav_services: lang === 'np' ? 'सार्वजनिक ई-सेवाहरू' : 'Citizen Services',
    nav_notices: lang === 'np' ? 'सूचना तथा विज्ञप्ति' : 'Notices',
    nav_contact: lang === 'np' ? 'सम्पर्क' : 'Contact Directory',
    nav_signin: lang === 'np' ? 'प्रणाली लगइन' : 'Portal Sign In',
    nav_register: lang === 'np' ? 'नागरिक दर्ता' : 'Citizen Register',

    // Notice Ticker
    urgent_notice_label: lang === 'np' ? 'जरुरी सूचना' : 'URGENT NOTICE',
    notice_text: lang === 'np' 
      ? 'ट्राफिक नियम उल्लङ्घन ई-चलान जरिवाना अब अनलाइन (ईसेवा - eSewa) मार्फत सिधै भुक्तानी गर्न सकिनेछ। • काठमाडौँ उपत्यका तथा प्रमुख राजमार्गहरूमा स्वचालित AI क्यामेरा निगरानी प्रणाली २४ सै घन्टा सक्रिय छ।'
      : 'Traffic violation citations can now be settled directly online via eSewa digital payment gateway. • Automated AI CCTV surveillance grid is operational 24/7 across major traffic corridors.',

    // Hero Search
    hero_badge: lang === 'np' ? 'राष्ट्रिय सवारी ई-चलान खोजी सेवा' : 'National Vehicle Citation Verification Service',
    hero_title: lang === 'np' ? 'सवारी नियम उल्लङ्घन ई-चलान स्थिति तथा जरिवाना भुक्तानी' : 'Vehicle Traffic Violation Citation Status & Fine Settlement',
    hero_desc: lang === 'np' 
      ? 'आफ्नो सवारी साधनको नम्बर वा नागरिकता विवरण प्रविष्ट गरी तत्काल उल्लङ्घन अभिलेख, फोटो प्रमाण हेर्नुहोस् र अनलाइन जरिवाना चुक्ता गर्नुहोस्।'
      : 'Enter your vehicle registration or citizenship details to inspect recorded violations, photographic evidence, and settle fines securely online.',
    tab_plate: lang === 'np' ? 'सवारी दर्ता नं' : 'Vehicle Plate Number',
    tab_citizen: lang === 'np' ? 'नागरिकता नं' : 'Citizenship Number',
    input_label_plate: lang === 'np' ? 'सवारी नम्बर प्रविष्ट गर्नुहोस्' : 'Enter Vehicle Registration Number (Plate Format)',
    input_placeholder_plate: lang === 'np' ? 'उदा: BA 2 PA 1234 वा बा २ प १२३४...' : 'e.g. BA 2 PA 1234 or Ba 2 Pa 1234...',
    input_label_citizen: lang === 'np' ? 'नागरिकता नम्बर' : 'Enter Citizenship / National ID Number',
    input_placeholder_citizen: lang === 'np' ? 'उदा: ०१-०१-७५-१२३४५...' : 'e.g. 01-01-75-12345...',
    btn_search: lang === 'np' ? 'ई-चलान विवरण खोज्नुहोस्' : 'Search Citation Record',
    secure_gov_db: lang === 'np' ? 'सुरक्षित सरकारी डेटाबेस मार्फत प्रमाणीकरण' : 'Verified via Secure Government Transport Database',
    quick_tip_label: lang === 'np' ? 'द्रुत सुझाव:' : 'Quick Tip:',
    quick_tip_text: lang === 'np' 
      ? 'नयाँ वा पुरानो ढाँचा दुवै नम्बर प्लेट मान्य छ (उदा. BA 2 PA 1234, प्रदेश ३-०२-००२ प १२३४)।'
      : 'Both standard embossed and legacy plate formats are accepted (e.g. BA 2 PA 1234, Province 3-02-002 Pa 1234).',

    // Portals
    portals_heading: lang === 'np' ? 'प्रणाली प्रवेशद्वारहरू' : 'Departmental Portals',
    portal_police_title: lang === 'np' ? 'ट्राफिक प्रहरी पोर्टल' : 'Traffic Police Portal',
    portal_police_desc: lang === 'np' ? 'स्वचालित AI प्रमाण प्रमाणीकरण, फिल्ड इन्फोर्समेन्ट तथा म्यानुअल चलान प्रविष्टि।' : 'AI evidence verification, field enforcement, and manual citation logging.',
    portal_citizen_title: lang === 'np' ? 'सवारी धनी / नागरिक पोर्टल' : 'Vehicle Owner & Citizen Portal',
    portal_citizen_desc: lang === 'np' ? 'सवारी विवरण, जरिवाना ई-भुक्तानी, रसिद डाउनलोड तथा गुनासो/विवाद दर्ता।' : 'Vehicle compliance status, instant fine payments, receipt downloads, and dispute filings.',
    portal_admin_title: lang === 'np' ? 'प्रशासकीय नियन्त्रण कक्ष' : 'Administrative Command Portal',
    portal_admin_desc: lang === 'np' ? 'क्यामेरा क्यालिब्रेसन, सवारी दर्ता व्यवस्थापन, नियम तथा प्रणाली अडिट।' : 'Camera zone calibration, vehicle registry, traffic rule management, and system audits.',
    hotline_box_label: lang === 'np' ? 'आपतकालीन ट्राफिक सहयोग तथा जानकारी' : 'Emergency Traffic Assistance & Control Desk',

    // Telemetry Stats
    stat_nodes_val: lang === 'np' ? '५०+' : '50+',
    stat_nodes_title: lang === 'np' ? 'निगरानी क्यामेरा नोडहरू' : 'Calibrated Smart CCTV Nodes',
    stat_nodes_sub: lang === 'np' ? 'स्मार्ट क्यामेरा ग्रिड' : 'Active Grid Cameras',
    stat_anpr_val: '99.2%',
    stat_anpr_title: lang === 'np' ? 'नम्बर प्लेट पहिचान दर' : 'ANPR Plate Recognition Accuracy',
    stat_anpr_sub: lang === 'np' ? 'अटोमेटेड क्यारेक्टर रिकग्निशन' : 'Automated OCR Inference',
    stat_citations_val: lang === 'np' ? '१२,४५०+' : '12,450+',
    stat_citations_title: lang === 'np' ? 'दर्ता भएका ई-चलानहरू' : 'Total Citations Processed',
    stat_citations_sub: lang === 'np' ? 'कुल डिजिटल चलान' : 'Logged & Verified',
    stat_settlement_val: '98.5%',
    stat_settlement_title: lang === 'np' ? 'डिजिटल फर्स्यौट दर' : 'Online Settlement Rate',
    stat_settlement_sub: lang === 'np' ? 'ई-भुक्तानी अनुपात' : 'Digital Clearance Ratio',

    // Services
    services_heading: lang === 'np' ? 'नागरिक केन्द्रित डिजिटल सेवाहरू' : 'Citizen-Centric Digital Services',
    services_sub: lang === 'np' ? 'सवारी चालक तथा नागरिकहरूका लागि उपलब्ध अनलाइन सेवा तथा सुविधाहरू।' : 'Online utilities and compliance tools available for all vehicle owners.',
    srv1_title: lang === 'np' ? 'अनलाइन जरिवाना भुक्तानी' : 'Online Fine Settlement',
    srv1_desc: lang === 'np' ? 'ईसेवा (eSewa) तथा आधिकारिक डिजिटल वालेट मार्फत सिधै जरिवाना भुक्तानी गर्नुहोस्।' : 'Direct fine settlement via eSewa digital wallet and connected mobile banking.',
    srv1_btn: lang === 'np' ? 'भुक्तानी गर्नुहोस्' : 'Pay Fine Now',
    srv2_title: lang === 'np' ? 'विवाद तथा गुनासो दर्ता' : 'Dispute & Appeal Lodging',
    srv2_desc: lang === 'np' ? 'त्रुटिवश ई-चलान जारी भएको लागेमा प्रमाणसहित अनलाइन उजुरी दर्ता गर्नुहोस्। प्रशासकबाट तत्काल पुनरावलोकन हुनेछ।' : 'Lodge a formal appeal with supporting evidence if a citation was issued in error.',
    srv2_btn: lang === 'np' ? 'उजुरी दर्ता गर्नुहोस्' : 'Lodge Dispute',
    srv3_title: lang === 'np' ? 'सवारी कर तथा बीमा स्थिति' : 'Tax & Insurance Compliance',
    srv3_desc: lang === 'np' ? 'आफ्नो सवारी साधनको वार्षिक कर तथा तेस्रो पक्ष बीमाको म्याद स्थिति अनलाइन रुजु गर्नुहोस्।' : 'Check annual vehicle road tax and third-party insurance validity status online.',
    srv3_btn: lang === 'np' ? 'स्थिति जाँच गर्नुहोस्' : 'Check Status',
    srv4_title: lang === 'np' ? 'डिजिटल रसिद / भौचर' : 'Official Challan Receipt',
    srv4_desc: lang === 'np' ? 'जरिवाना फर्स्यौट पश्चात नेपाल सरकारको आधिकारिक डिजिटल चलान रसिद तुरुन्त डाउनलोड गर्नुहोस्।' : 'Instantly download official Government of Nepal payment confirmation receipts.',
    srv4_btn: lang === 'np' ? 'रसिद हेर्नुहोस्' : 'Download Receipt',

    // Rules
    rules_ref: lang === 'np' ? 'सवारी तथा यातायात व्यवस्था ऐन, २०४९ बमोजिम' : 'Pursuant to Motor Vehicles & Transport Management Act, 2049',
    rules_heading: lang === 'np' ? 'प्रमुख ट्राफिक नियम उल्लङ्घन तथा जरिवाना अनुसूची' : 'Official Traffic Rules & Fine Schedule',
    rules_view_all: lang === 'np' ? 'सम्पूर्ण कानुनी अनुसूची हेर्नुहोस्' : 'View Full Legal Catalog',
    col_code: lang === 'np' ? 'नियम सङ्केत' : 'Rule Code',
    col_violation: lang === 'np' ? 'उल्लङ्घनको विवरण' : 'Violation Category',
    col_section: lang === 'np' ? 'कानुनी दफा' : 'Legal Section',
    col_fine: lang === 'np' ? 'जरिवाना रकम' : 'Fine Amount',
    col_demerit: lang === 'np' ? 'नकारात्मक अङ्क' : 'Demerit Points',
    col_action: lang === 'np' ? 'कार्य' : 'Action',
    action_check: lang === 'np' ? 'चलान जाँच →' : 'Check Citation →',

    // Notices
    notices_heading: lang === 'np' ? 'सूचना तथा प्रेस विज्ञप्तिहरू' : 'Official Notices & Press Bulletins',
    notices_sub: lang === 'np' ? 'ट्राफिक प्रहरी महाशाखा तथा यातायात मन्त्रालयद्वारा जारी आधिकारिक सूचनाहरू।' : 'Directives and bulletins issued by the Traffic Police Division and Ministry.',
    read_more: lang === 'np' ? 'पूर्ण विवरण पढ्नुहोस्' : 'Read Full Notice',

    // Contact & RTI
    contact_heading: lang === 'np' ? 'कार्यालय ठेगाना तथा सम्पर्क विवरण' : 'Office Address & Contact Directory',
    contact_sub: lang === 'np' 
      ? 'सवारी नियम उल्लङ्घन, ई-चलान प्रमाणीकरण वा अन्य जानकारीको लागि सम्बन्धित महाशाखा तथा सूचना अधिकारीसँग सम्पर्क गर्न सक्नुहुनेछ।'
      : 'For violation verification, digital fine queries, or administrative information, contact our headquarters.',
    hq_title: lang === 'np' ? 'उपत्यका ट्राफिक प्रहरी महाशाखा (केन्द्रीय कार्यालय)' : 'Valley Traffic Police Division (Central Headquarters)',
    hq_address: lang === 'np' ? 'बग्गीखाना, सिंहदरबार नजिक, काठमाडौँ, नेपाल' : 'Baggikhana, Singhadurbar Corridor, Kathmandu, Nepal',
    phone_label: lang === 'np' ? 'फोन / हटलाइन:' : 'Phone / Hotline:',
    email_label: lang === 'np' ? 'ईमेल:' : 'Email:',
    rti_heading: lang === 'np' ? 'सूचनाको हक (Right to Information) सम्बन्धी विवरण' : 'Right to Information (RTI) Information',
    rti_desc: lang === 'np' 
      ? 'नेपालको संविधानको धारा २७ तथा सूचनाको हक सम्बन्धी ऐन, २०६४ बमोजिम यस महाशाखासँग सम्बन्धित सार्वजनिक सूचना प्राप्त गर्न सक्नुहुनेछ।'
      : 'Pursuant to Article 27 of the Constitution of Nepal and the Right to Information Act, 2064, citizens may request official public records.',
    rti_officer_title: lang === 'np' ? 'सूचना अधिकारी:' : 'Information Officer (RTI):',
    rti_officer_name: lang === 'np' ? 'प्रहरी नायव उपरीक्षक (DSP) - उपत्यका ट्राफिक प्रहरी महाशाखा' : 'Deputy Superintendent of Police (DSP) - Traffic Division',
    rti_contact: lang === 'np' ? 'सम्पर्क: +९७७-९८४२०२६७७१ / १०३' : 'Contact: +977-9842026771 / Hotline 103',

    // Footer
    footer_motto: lang === 'np' ? '"जननी जन्मभूमिश्च स्वर्गादपि गरीयसी"' : '"Mother and Motherland are Greater than Heaven"',
    footer_related: lang === 'np' ? 'सम्बन्धित निकायहरू' : 'Related Ministries & Bodies',
    footer_features: lang === 'np' ? 'प्रणाली सुविधाहरू' : 'System Features',
    footer_tech: lang === 'np' ? 'प्राविधिक विवरण' : 'Technical & Legal Details',
    footer_dev: lang === 'np' ? 'विकसित: Premlata & Aavash • नेपाल सरकार © २०८३' : 'Developed by: Premlata & Aavash • Government of Nepal © 2026',
    footer_disclaimer: lang === 'np' 
      ? 'यो पोर्टल नेपाल सरकारको आधिकारिक ट्राफिक नियमन तथा ई-चलान व्यवस्थापनका लागि सञ्चालन गरिएको हो।'
      : 'This portal is officially operated by the Government of Nepal for traffic regulation and digital citation management.'
  };

  const trafficRules = [
    { 
      code: 'TR-01', 
      title: lang === 'np' ? 'ट्राफिक बत्ती उल्लङ्घन' : 'Traffic Light Red Signal Violation', 
      desc: lang === 'np' ? 'रातो बत्ती बलेको अवस्थामा चोक पार गरेको' : 'Crossing intersection during red signal phase',
      fine: lang === 'np' ? 'रु १,५००' : 'NPR 1,500', 
      section: lang === 'np' ? 'दफा १६४ (१)' : 'Section 164 (1)', 
      demerit: lang === 'np' ? '२ अङ्क' : '2 Demerits' 
    },
    { 
      code: 'TR-02', 
      title: lang === 'np' ? 'हेल्मेट / सुरक्षा पेटी प्रयोग नगरेको' : 'Helmet & Seatbelt Non-Compliance', 
      desc: lang === 'np' ? 'सवारी चालक वा पछाडि बस्नेले हेल्मेट नलगाएको' : 'Rider or pillion passenger without certified helmet',
      fine: lang === 'np' ? 'रु १,०००' : 'NPR 1,000', 
      section: lang === 'np' ? 'दफा १६४ (२)' : 'Section 164 (2)', 
      demerit: lang === 'np' ? '१ अङ्क' : '1 Demerit' 
    },
    { 
      code: 'TR-03', 
      title: lang === 'np' ? 'जेब्रा क्रसिङ तथा पैदलयात्री अवरोध' : 'Zebra Crossing & Pedestrian Obstruction', 
      desc: lang === 'np' ? 'पैदलयात्री पार गर्ने स्थानमा सवारी रोकेको' : 'Encroaching pedestrian crossing zone during walk signal',
      fine: lang === 'np' ? 'रु १,०००' : 'NPR 1,000', 
      section: lang === 'np' ? 'दफा १६४ (३)' : 'Section 164 (3)', 
      demerit: lang === 'np' ? '१ अङ्क' : '1 Demerit' 
    },
    { 
      code: 'TR-04', 
      title: lang === 'np' ? 'गलत लेन / एकतर्फी मार्ग उल्लङ्घन' : 'Lane Discipline & One-Way Violation', 
      desc: lang === 'np' ? 'विपरीत दिशा वा ठोस रेखा पार गरी सवारी चलाएको' : 'Driving against flow or crossing continuous solid line',
      fine: lang === 'np' ? 'रु १,५००' : 'NPR 1,500', 
      section: lang === 'np' ? 'दफा १६४ (४)' : 'Section 164 (4)', 
      demerit: lang === 'np' ? '२ अङ्क' : '2 Demerits' 
    },
    { 
      code: 'TR-05', 
      title: lang === 'np' ? 'तीव्र गतिमा सवारी चलाएको' : 'Over-Speeding in Urban Corridors', 
      desc: lang === 'np' ? 'तोकिएको गति सीमा भन्दा बढी गतिमा चलाएको' : 'Exceeding designated urban zone speed limit by > 15 km/h',
      fine: lang === 'np' ? 'रु २,०००' : 'NPR 2,000', 
      section: lang === 'np' ? 'दफा १६४ (५)' : 'Section 164 (5)', 
      demerit: lang === 'np' ? '३ अङ्क' : '3 Demerits' 
    },
  ];

  const notices = [
    { 
      date: lang === 'np' ? '२०८३/०५/१५' : '2026/08/31', 
      title: lang === 'np' 
        ? 'सवारी ई-चलान जरिवाना अब अनलाइन (ईसेवा) मार्फत सिधै भुक्तानी गर्न सकिने सम्बन्धी अत्यन्त जरुरी सूचना।' 
        : 'Notice regarding direct digital settlement of traffic citations through eSewa payment gateway.' 
    },
    { 
      date: lang === 'np' ? '२०८३/०५/१०' : '2026/08/25', 
      title: lang === 'np' 
        ? 'काठमाडौँ उपत्यका तथा प्रमुख राजमार्गहरूमा स्वचालित AI क्यामेरा निगरानी प्रणाली विस्तार गरिएको बारे प्रेस विज्ञप्ति।' 
        : 'Press release regarding expansion of automated AI camera surveillance network across highway intersections.' 
    },
    { 
      date: lang === 'np' ? '२०८३/०४/२८' : '2026/08/12', 
      title: lang === 'np' 
        ? 'सवारी चालक अनुमतिपत्र तथा सवारी दर्ता प्रमाणपत्र (ब्लुबुक) डिजिटलाइजेसन सम्बन्धमा यातायात व्यवस्था विभागको निर्देशन।' 
        : 'DoTM official guidelines on digital integration of Driving Licenses and Vehicle Registration certificates.' 
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800 antialiased selection:bg-[#003893] selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. TOP OFFICIAL GOVERNMENT STRIP WITH OFFICIAL LANGUAGE SELECTOR */}
      {/* ========================================================================= */}
      <div className="bg-[#990000] text-white py-1.5 px-4 sm:px-8 border-b border-red-900 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          
          <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
            <span className="font-semibold tracking-wide flex items-center">
              🇳🇵 <span className="ml-1.5">{t.top_gov}</span>
            </span>
            <span className="hidden md:inline text-red-200">|</span>
            <span className="hidden md:inline text-red-100 font-medium">{t.top_ministry}</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] sm:text-xs">
            <div className="hidden lg:flex items-center space-x-1.5 text-red-100">
              <Clock size={12} className="text-red-200" />
              <span>{currentDateTime || 'Active Official Portal'}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="bg-red-950/80 px-2 py-0.5 rounded text-white font-bold border border-red-800 hidden sm:inline">
                {t.hotline}
              </span>

              {/* AUTHENTIC GOVERNMENT LANGUAGE SELECTOR TOGGLE */}
              <div className="flex items-center bg-red-950/90 p-0.5 rounded-lg border border-red-700/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleSetLang('np')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
                    lang === 'np'
                      ? 'bg-white text-[#990000] shadow-sm font-extrabold'
                      : 'text-red-200 hover:text-white'
                  }`}
                  title="नेपाली भाषा चयन गर्नुहोस्"
                >
                  <span>नेपाली</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSetLang('en')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all flex items-center space-x-1 ${
                    lang === 'en'
                      ? 'bg-white text-[#990000] shadow-sm font-extrabold'
                      : 'text-red-200 hover:text-white'
                  }`}
                  title="Switch to English Language"
                >
                  <span>English</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OFFICIAL GOVERNMENT HEADER WITH NEPAL MAP (सरकारी पहिचान तथा नेपाल नक्सा) */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Official Nepal Map & Hierarchy */}
          <div className="flex items-center space-x-4">
            
            {/* Official Nepal Police Insignia Logo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center p-1 bg-white rounded-full border-2 border-amber-500/30 shadow-md hover:scale-105 transition-transform duration-300 overflow-hidden">
              <img 
                src={policeLogo} 
                alt="Nepal Police Official Emblem" 
                className="w-full h-full object-contain rounded-full"
              />
            </div>

            <div className="text-left">
              <p className="text-xs font-semibold text-[#990000] uppercase tracking-wide leading-tight">
                {t.top_gov}
              </p>
              <p className="text-xs text-slate-600 font-medium leading-tight mt-0.5">
                {t.police_division}
              </p>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[#003893] tracking-tight leading-tight mt-0.5">
                {t.system_title}
              </h1>
              <p className="text-xs font-semibold text-slate-500 tracking-wide">
                {t.system_sub}
              </p>
            </div>

          </div>

          {/* Institutional Compliance & Emergency Badge */}
          <div className="hidden lg:flex items-center space-x-6 border-l border-slate-200 pl-6">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {t.live_badge}
              </span>
              <p className="text-xs font-bold text-slate-800 mt-1 font-mono">
                {t.control_room}
              </p>
              <p className="text-[11px] text-slate-500">
                {t.central_control}
              </p>
            </div>
            
            <div className="w-10 h-10 bg-[#003893] text-white rounded-lg flex items-center justify-center font-bold shadow-sm">
              <Shield size={20} />
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN NAVIGATION BAR (मुख्य मेनु) */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 bg-[#0F2C59] text-white shadow-md border-b-2 border-[#990000]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center">
          
          {/* Nav Links */}
          <div className="hidden md:flex space-x-1 lg:space-x-2 text-sm font-medium">
            <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="px-3.5 py-3 text-white hover:bg-white/10 transition-colors border-b-2 border-white">
              {t.nav_home}
            </a>
            <a href="#search" onClick={(e) => scrollToSection(e, 'search')} className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t.nav_search}
            </a>
            <a href="#rules" onClick={(e) => scrollToSection(e, 'rules')} className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t.nav_rules}
            </a>
            <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t.nav_services}
            </a>
            <a href="#notices" onClick={(e) => scrollToSection(e, 'notices')} className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t.nav_notices}
            </a>
            <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="px-3.5 py-3 text-slate-200 hover:text-white hover:bg-white/10 transition-colors">
              {t.nav_contact}
            </a>
          </div>

          {/* Quick Sign In / Portal Access */}
          <div className="hidden md:flex items-center space-x-2 py-2">
            <Link to="/login" className="px-3.5 py-1.5 text-xs font-semibold bg-white text-[#0F2C59] hover:bg-slate-100 rounded transition-colors shadow-sm">
              {t.nav_signin}
            </Link>
            <Link to="/register" className="px-3.5 py-1.5 text-xs font-semibold bg-[#990000] hover:bg-red-700 text-white rounded transition-colors shadow-sm">
              {t.nav_register}
            </Link>
          </div>

          {/* Mobile Menu Header */}
          <div className="flex md:hidden justify-between items-center w-full py-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              TVDS {lang === 'np' ? 'मेनु' : 'Menu'}
            </span>
            <button className="p-1 text-slate-200 hover:text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F2C59] border-b border-slate-700 px-6 py-4 space-y-3 animate-fade-in text-sm">
          <a href="#home" onClick={(e) => scrollToSection(e, 'home')} className="block py-2 text-white border-b border-white/10">{t.nav_home}</a>
          <a href="#search" onClick={(e) => scrollToSection(e, 'search')} className="block py-2 text-slate-200 border-b border-white/10">{t.nav_search}</a>
          <a href="#rules" onClick={(e) => scrollToSection(e, 'rules')} className="block py-2 text-slate-200 border-b border-white/10">{t.nav_rules}</a>
          <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="block py-2 text-slate-200 border-b border-white/10">{t.nav_services}</a>
          <a href="#notices" onClick={(e) => scrollToSection(e, 'notices')} className="block py-2 text-slate-200 border-b border-white/10">{t.nav_notices}</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="block py-2 text-slate-200 border-b border-white/10">{t.nav_contact}</a>
          
          {/* Mobile Language Switcher */}
          <div className="py-2 flex items-center justify-between border-b border-white/10">
            <span className="text-xs text-slate-300 font-medium">भाषा चयन / Language:</span>
            <div className="flex space-x-1">
              <button 
                onClick={() => { handleSetLang('np'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded text-xs font-bold ${lang === 'np' ? 'bg-white text-[#990000]' : 'bg-slate-800 text-white'}`}
              >
                नेपाली
              </button>
              <button 
                onClick={() => { handleSetLang('en'); setMobileMenuOpen(false); }}
                className={`px-3 py-1 rounded text-xs font-bold ${lang === 'en' ? 'bg-white text-[#990000]' : 'bg-slate-800 text-white'}`}
              >
                English
              </button>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link to="/login" className="w-full text-center py-2 bg-white text-[#0F2C59] font-bold rounded" onClick={() => setMobileMenuOpen(false)}>{t.nav_signin}</Link>
            <Link to="/register" className="w-full text-center py-2 bg-[#990000] text-white font-bold rounded" onClick={() => setMobileMenuOpen(false)}>{t.nav_register}</Link>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. BREAKING NOTICE TICKER (सार्वजनिक सूचना पट्टी) */}
      {/* ========================================================================= */}
      <div className="bg-amber-50 border-b border-amber-200 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="bg-[#990000] text-white px-2.5 py-0.5 rounded font-bold text-[11px] shrink-0 uppercase tracking-wide flex items-center">
            <Bell size={12} className="mr-1" /> {t.urgent_notice_label}
          </span>
          <div className="overflow-hidden whitespace-nowrap text-slate-700 font-medium">
            <p className="inline-block animate-marquee">
              {t.notice_text}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. HERO & CITIZEN CITATION LOOKUP BOX (ई-चलान खोजी तथा मुख्य खण्ड) */}
      {/* ========================================================================= */}
      <section id="home" className="py-10 lg:py-14 px-4 sm:px-8 bg-gradient-to-b from-white to-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Official Citation Search Box */}
            <div className="lg:col-span-7 space-y-6">
              
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-blue-50 text-[#003893] border border-blue-200 text-xs font-semibold mb-3">
                  <FileCheck size={14} />
                  <span>{t.hero_badge}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  {t.hero_title}
                </h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {t.hero_desc}
                </p>
              </div>

              {/* Citizen Search Card (Clean, Institutional Form) */}
              <div id="search" className="bg-white rounded-xl border-2 border-slate-300 shadow-md p-5 sm:p-6 space-y-4">
                
                {/* Search Mode Tabs */}
                <div className="flex border-b border-slate-200">
                  <button 
                    onClick={() => setSearchTab('plate')}
                    className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                      searchTab === 'plate' 
                        ? 'border-[#003893] text-[#003893]' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.tab_plate}
                  </button>
                  <button 
                    onClick={() => setSearchTab('citizen')}
                    className={`pb-2.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors ${
                      searchTab === 'citizen' 
                        ? 'border-[#003893] text-[#003893]' 
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t.tab_citizen}
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSearchCitation} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {searchTab === 'plate' ? t.input_label_plate : t.input_label_citizen}
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text"
                        placeholder={searchTab === 'plate' ? t.input_placeholder_plate : t.input_placeholder_citizen}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono text-sm font-medium focus:outline-none focus:border-[#003893] focus:bg-white focus:ring-1 focus:ring-[#003893] uppercase transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center">
                    <button 
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 bg-[#003893] hover:bg-[#0F2C59] text-white text-sm font-bold rounded-lg shadow transition-colors flex items-center justify-center space-x-2"
                    >
                      <Search size={16} />
                      <span>{t.btn_search}</span>
                    </button>
                    
                    <span className="text-xs text-slate-500 text-center sm:text-left">
                      {t.secure_gov_db}
                    </span>
                  </div>
                </form>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">{t.quick_tip_label}</span>
                  <span>{t.quick_tip_text}</span>
                </div>

              </div>

            </div>

            {/* Right Col: Official Portal Gateways */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2 flex items-center">
                  <Building2 size={16} className="text-[#003893] mr-2" />
                  {t.portals_heading}
                </h3>

                {/* Gateway 1: Traffic Police */}
                <Link 
                  to="/login?role=police" 
                  className="group flex items-start p-3 rounded-lg border border-slate-200 hover:border-[#003893] hover:bg-blue-50/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#003893] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Shield size={20} />
                  </div>
                  <div className="ml-3.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#003893] transition-colors">
                        {t.portal_police_title}
                      </h4>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-[#003893] transform group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.portal_police_desc}
                    </p>
                  </div>
                </Link>

                {/* Gateway 2: Vehicle Owner / Citizen */}
                <Link 
                  to="/login?role=owner" 
                  className="group flex items-start p-3 rounded-lg border border-slate-200 hover:border-[#003893] hover:bg-blue-50/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#990000] text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <UserCheck size={20} />
                  </div>
                  <div className="ml-3.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#003893] transition-colors">
                        {t.portal_citizen_title}
                      </h4>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-[#003893] transform group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.portal_citizen_desc}
                    </p>
                  </div>
                </Link>

                {/* Gateway 3: Department Administrator */}
                <Link 
                  to="/login?role=admin" 
                  className="group flex items-start p-3 rounded-lg border border-slate-200 hover:border-[#003893] hover:bg-blue-50/50 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                    <Lock size={18} />
                  </div>
                  <div className="ml-3.5 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#003893] transition-colors">
                        {t.portal_admin_title}
                      </h4>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-[#003893] transform group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.portal_admin_desc}
                    </p>
                  </div>
                </Link>

              </div>

              {/* Emergency Hotline Box */}
              <div className="bg-[#990000] text-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase font-bold text-red-200">{t.hotline_box_label}</p>
                  <p className="text-lg font-bold font-mono">Hotline: 103 (Toll Free)</p>
                </div>
                <Phone size={24} className="text-red-200" />
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. REAL-TIME NATIONAL TRAFFIC TELEMETRY (राष्ट्रिय ट्राफिक तथ्याङ्क) */}
      {/* ========================================================================= */}
      <section className="bg-white py-8 px-4 sm:px-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            
            <div className="text-center px-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#003893] font-mono">{t.stat_nodes_val}</span>
              <p className="text-xs font-bold text-slate-700 mt-1">{t.stat_nodes_title}</p>
              <p className="text-[11px] text-slate-500">{t.stat_nodes_sub}</p>
            </div>

            <div className="text-center px-4 pt-4 sm:pt-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">{t.stat_anpr_val}</span>
              <p className="text-xs font-bold text-slate-700 mt-1">{t.stat_anpr_title}</p>
              <p className="text-[11px] text-slate-500">{t.stat_anpr_sub}</p>
            </div>

            <div className="text-center px-4 pt-4 sm:pt-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#990000] font-mono">{t.stat_citations_val}</span>
              <p className="text-xs font-bold text-slate-700 mt-1">{t.stat_citations_title}</p>
              <p className="text-[11px] text-slate-500">{t.stat_citations_sub}</p>
            </div>

            <div className="text-center px-4 pt-4 sm:pt-0">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-mono">{t.stat_settlement_val}</span>
              <p className="text-xs font-bold text-slate-700 mt-1">{t.stat_settlement_title}</p>
              <p className="text-[11px] text-slate-500">{t.stat_settlement_sub}</p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. CITIZEN DIGITAL SERVICES GRID (सार्वजनिक ई-सेवाहरू) */}
      {/* ========================================================================= */}
      <section id="services" className="py-14 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {t.services_heading}
            </h2>
            <p className="text-sm text-slate-600">
              {t.services_sub}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Service 1: Pay Fines */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4">
                  <CreditCard size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.srv1_title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t.srv1_desc}
                </p>
              </div>
              <Link to="/login" className="text-xs font-bold text-[#003893] hover:underline flex items-center pt-2">
                <span>{t.srv1_btn}</span>
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>

            {/* Service 2: Complaint / Dispute */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#003893] flex items-center justify-center mb-4">
                  <Scale size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.srv2_title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t.srv2_desc}
                </p>
              </div>
              <Link to="/login" className="text-xs font-bold text-[#003893] hover:underline flex items-center pt-2">
                <span>{t.srv2_btn}</span>
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>

            {/* Service 3: Vehicle Compliance Check */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                  <FileCheck size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.srv3_title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t.srv3_desc}
                </p>
              </div>
              <Link to="/login" className="text-xs font-bold text-[#003893] hover:underline flex items-center pt-2">
                <span>{t.srv3_btn}</span>
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>

            {/* Service 4: Official Receipt Download */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="font-bold text-slate-900 text-base">{t.srv4_title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {t.srv4_desc}
                </p>
              </div>
              <Link to="/login" className="text-xs font-bold text-[#003893] hover:underline flex items-center pt-2">
                <span>{t.srv4_btn}</span>
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. OFFICIAL TRAFFIC RULES & FINE RATE-CARD (नियम तथा जरिवाना अनुसूची) */}
      {/* ========================================================================= */}
      <section id="rules" className="py-14 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-bold text-[#990000] uppercase tracking-wide">
                {t.rules_ref}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
                {t.rules_heading}
              </h2>
            </div>
            <Link to="/login" className="text-xs font-bold text-[#003893] hover:underline flex items-center">
              <span>{t.rules_view_all}</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-left text-xs sm:text-sm text-slate-700">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">{t.col_code}</th>
                  <th className="px-5 py-3.5">{t.col_violation}</th>
                  <th className="px-5 py-3.5">{t.col_section}</th>
                  <th className="px-5 py-3.5">{t.col_fine}</th>
                  <th className="px-5 py-3.5">{t.col_demerit}</th>
                  <th className="px-5 py-3.5 text-right">{t.col_action}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {trafficRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#003893]">{rule.code}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{rule.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{rule.desc}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-600">{rule.section}</td>
                    <td className="px-5 py-3.5 font-bold text-[#990000] font-mono">{rule.fine}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{rule.demerit}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link to="/login" className="text-xs font-bold text-[#003893] hover:underline">
                        {t.action_check}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. NOTICES & PRESS RELEASES (सूचना तथा प्रेस विज्ञप्ति) */}
      {/* ========================================================================= */}
      <section id="notices" className="py-14 px-4 sm:px-8 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                {t.notices_heading}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.notices_sub}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notices.map((n, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-red-50 text-[#990000] font-mono text-[11px] font-bold border border-red-100 mb-2">
                    {n.date}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                    {n.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#003893] hover:underline cursor-pointer flex items-center pt-2">
                  <span>{t.read_more}</span>
                  <ChevronRight size={14} className="ml-0.5" />
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. OFFICIAL CONTACT DIRECTORY & RTI (सम्पर्क तथा सूचना अधिकारी) */}
      {/* ========================================================================= */}
      <section id="contact" className="py-14 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left info */}
          <div className="md:col-span-6 space-y-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {t.contact_heading}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {t.contact_sub}
            </p>

            <div className="space-y-3 pt-2 text-sm text-slate-700">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#990000] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">{t.hq_title}</p>
                  <p className="text-xs text-slate-500">{t.hq_address}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-[#003893] shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">{t.phone_label}</span>{' '}
                  <span className="font-mono text-slate-800 font-semibold">{lang === 'np' ? '+९७७-१-४२१९६४१ / १०३' : '+977-1-4219641 / 103'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-[#003893] shrink-0" />
                <div>
                  <span className="font-bold text-slate-900">{t.email_label}</span>{' '}
                  <a href="mailto:chaudharypremlata10@gmail.com" className="text-[#003893] hover:underline font-mono text-xs">
                    chaudharypremlata10@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right: RTI & Grievance Officer */}
          <div className="md:col-span-6 bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
              <Info size={18} className="text-[#003893]" />
              <h3 className="font-bold text-slate-900 text-sm uppercase">
                {t.rti_heading}
              </h3>
            </div>

            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                {t.rti_desc}
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">{t.rti_officer_title}</p>
                <p className="text-slate-700">{t.rti_officer_name}</p>
                <p className="text-slate-500 font-mono">{t.rti_contact}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. OFFICIAL GOVERNMENT FOOTER (आधिकारिक फुटर) */}
      {/* ========================================================================= */}
      <footer className="bg-[#0F2C59] text-white py-10 px-4 sm:px-8 border-t-4 border-[#990000] text-xs">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Government Identity */}
            <div className="space-y-3">
              <p className="font-bold text-sm tracking-wide">{t.top_gov}</p>
              <p className="text-xs text-slate-300">
                {t.top_ministry} <br />
                {t.police_division}
              </p>
              <p className="text-[11px] text-slate-400 font-serif italic mt-2">
                {t.footer_motto}
              </p>
            </div>

            {/* Col 2: Useful Links */}
            <div className="space-y-2">
              <p className="font-bold text-sm text-slate-200">{t.footer_related}</p>
              <ul className="space-y-1.5 text-slate-300 text-xs">
                <li><a href="https://nepalpolice.gov.np" target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center">Nepal Police <ExternalLink size={10} className="ml-1 opacity-70" /></a></li>
                <li><a href="https://dotm.gov.np" target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center">Department of Transport Management (DoTM) <ExternalLink size={10} className="ml-1 opacity-70" /></a></li>
                <li><a href="https://mopit.gov.np" target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center">Ministry of Physical Infrastructure (MoPIT) <ExternalLink size={10} className="ml-1 opacity-70" /></a></li>
                <li><a href="https://nagarikapp.gov.np" target="_blank" rel="noreferrer" className="hover:text-white hover:underline flex items-center">Nagarik App (नागरिक एप) <ExternalLink size={10} className="ml-1 opacity-70" /></a></li>
              </ul>
            </div>

            {/* Col 3: Portal Links */}
            <div className="space-y-2">
              <p className="font-bold text-sm text-slate-200">{t.footer_features}</p>
              <ul className="space-y-1.5 text-slate-300 text-xs">
                <li><Link to="/login" className="hover:text-white hover:underline">{t.nav_search}</Link></li>
                <li><Link to="/login" className="hover:text-white hover:underline">{t.srv1_title}</Link></li>
                <li><Link to="/login" className="hover:text-white hover:underline">{t.srv2_title}</Link></li>
                <li><Link to="/register" className="hover:text-white hover:underline">{t.nav_register}</Link></li>
              </ul>
            </div>

            {/* Col 4: Technical & Legal */}
            <div className="space-y-2">
              <p className="font-bold text-sm text-slate-200">{t.footer_tech}</p>
              <p className="text-slate-300 text-xs leading-relaxed">
                {t.system_title} v2.4.0 <br />
                {t.footer_dev}
              </p>
              <div className="pt-2 text-slate-400 text-[11px]">
                {lang === 'np' ? 'सर्वाधिकार सुरक्षित © २०८३ नेपाल सरकार' : 'All Rights Reserved © 2026 Government of Nepal'}
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-white/10 text-center text-slate-400 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>{t.footer_disclaimer}</span>
            <span className="font-mono text-slate-300">Government Standard Web Portal • e-Governance Compliant</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;
