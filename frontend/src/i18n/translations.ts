export type Language = 'en' | 'hi' | 'mr';

export const translations = {
  en: {
    app_title: "CYCLOPATH AI",
    tagline: "Predict the impact. Protect the infrastructure. Save communities.",
    subtitle: "From cyclone forecasts to actionable infrastructure intelligence.",
    status_operational: "System Status: OPERATIONAL",
    active_scenario: "Active: Cyclone SAMUDRA (Cat 4)",
    demo_badge: "DEMO SIMULATION",
    disclaimer_banner: "Decision-Support Prototype: Model predictions must be verified against official IMD bulletins and SDMA directives.",
    
    // Navigation
    nav_dashboard: "Command Center",
    nav_risk_map: "Risk Map",
    nav_infrastructure: "Infrastructure",
    nav_cyclone_intel: "Cyclone Intelligence",
    nav_simulator: "Scenario Simulator",
    nav_ai_agent: "AI Response Agent",
    nav_routing: "Safe Routing",
    nav_inspector: "Multimodal AI",
    nav_alerts: "Live Alerts",
    nav_reports: "Assessment Reports",
    nav_data_sources: "Data Sources",
    nav_settings: "Risk Engine Settings",

    // Roles
    role_authority: "Disaster Management Authority",
    role_municipal: "Municipal Government Officer",
    role_responder: "Emergency Responder",
    role_public: "General Public / Citizen",

    // Dashboard Metrics
    metric_cyclone_name: "Cyclone Tracking",
    metric_wind_speed: "Peak Sustained Winds",
    metric_pressure: "Central Pressure",
    metric_movement: "Track Movement",
    metric_landfall: "Projected Landfall",
    metric_critical_assets: "Critical Assets at Risk",
    metric_high_risk: "High-Risk Facilities",
    metric_monitored: "Infrastructure Monitored",
    metric_population_exposed: "Estimated Population Exposed",
    metric_shelters_active: "Designated Shelters",
    metric_storm_surge: "Storm Surge Potential",
    metric_rainfall: "24h Rainfall Forecast",

    // Infrastructure Types
    type_all: "All Infrastructure",
    type_hospital: "Hospitals",
    type_power: "Power Substations",
    type_bridge: "Bridges",
    type_road: "Highways & Roads",
    type_shelter: "Cyclone Shelters",
    type_water: "Water Plants",
    type_port: "Ports & Harbors",

    // Risk Levels
    risk_critical: "CRITICAL",
    risk_high: "HIGH",
    risk_moderate: "MODERATE",
    risk_low: "LOW",

    // Action Buttons
    btn_launch_command: "Launch Command Center",
    btn_explore_demo: "Explore Demo Story",
    btn_simulate: "Simulate Scenario Impact",
    btn_ask_ai: "Consult AI Response Agent",
    btn_optimize_route: "Calculate Safe Evacuation Route",
    btn_inspect_asset: "Explainable Risk Factors",
    btn_generate_report: "Download Assessment Report",
    btn_ack_alert: "Acknowledge Alert",
    btn_apply_weights: "Update Risk Calculation Weights",

    // Common labels
    search_placeholder: "Search assets by name, district, or ID...",
    filter_district: "All Coastal Districts",
    filter_risk: "All Risk Levels",
    explainable_ai_title: "Explainable AI (SHAP-Style Factor Attribution)",
    recommended_actions_title: "Prioritized Emergency Directives",
    baseline: "Operational Baseline",
    scenario: "Simulated Scenario",
    risk_delta: "Risk Severity Jump"
  },

  hi: {
    app_title: "साइक्लोपाथ AI",
    tagline: "प्रभाव का पूर्वानुमान। बुनियादी ढांचे की सुरक्षा। समुदायों की रक्षा।",
    subtitle: "चक्रवात पूर्वानुमान से लेकर त्वरित बुनियादी ढांचा जोखिम खुफिया तक।",
    status_operational: "प्रणाली स्थिति: सक्रिय और संचालित",
    active_scenario: "सक्रिय परिदृश्य: चक्रवात समुद्र (श्रेणी 4)",
    demo_badge: "डेमो सिमुलेशन",
    disclaimer_banner: "निर्णय-समर्थन प्रोटोटाइप: मॉडल अनुमानों को आधिकारिक IMD और राज्य आपदा प्रबंधन के निर्देशों के साथ सत्यापित किया जाना चाहिए।",

    // Navigation
    nav_dashboard: "कमांड सेंटर",
    nav_risk_map: "जोखिम मानचित्र",
    nav_infrastructure: "बुनियादी ढांचा",
    nav_cyclone_intel: "चक्रवात खुफिया",
    nav_simulator: "परिदृश्य सिम्युलेटर",
    nav_ai_agent: "AI प्रतिक्रिया एजेंट",
    nav_routing: "सुरक्षित मार्ग",
    nav_inspector: "मल्टीमॉडल AI",
    nav_alerts: "अलर्ट फ़ीड",
    nav_reports: "आकलन रिपोर्ट",
    nav_data_sources: "डेटा स्रोत",
    nav_settings: "जोखिम इंजन सेटिंग्स",

    // Roles
    role_authority: "आपदा प्रबंधन प्राधिकरण",
    role_municipal: "नगर निगम / प्रशासनिक अधिकारी",
    role_responder: "आपातकालीन प्रतिक्रिया दल",
    role_public: "आम नागरिक / समुदाय",

    // Dashboard Metrics
    metric_cyclone_name: "चक्रवात ट्रैकिंग",
    metric_wind_speed: "अधिकतम हवा की गति",
    metric_pressure: "केंद्रीय वायुमंडलीय दबाव",
    metric_movement: "गति और दिशा",
    metric_landfall: "अनुमानित लैंडफॉल",
    metric_critical_assets: "अति-संवेदनशील ढांचा",
    metric_high_risk: "उच्च जोखिम सुविधाएं",
    metric_monitored: "निगरानी अधीन संपत्तियां",
    metric_population_exposed: "संभावित प्रभावित आबादी",
    metric_shelters_active: "सक्रिय चक्रवात आश्रय",
    metric_storm_surge: "तूफानी समुद्री लहरें (सर्ज)",
    metric_rainfall: "24 घंटे की वर्षा का अनुमान",

    // Infrastructure Types
    type_all: "सभी बुनियादी ढांचा",
    type_hospital: "अस्पताल",
    type_power: "बिजली ग्रिड / सबस्टेशन",
    type_bridge: "पुल",
    type_road: "राजमार्ग और मुख्य सड़कें",
    type_shelter: "चक्रवात आश्रय केंद्र",
    type_water: "जल शोधन संयंत्र",
    type_port: "बंदरगाह और तटीय टर्मिनल",

    // Risk Levels
    risk_critical: "गंभीर (क्रिटिकल)",
    risk_high: "उच्च जोखिम",
    risk_moderate: "मध्यम",
    risk_low: "सुरक्षित / कम",

    // Action Buttons
    btn_launch_command: "कमांड सेंटर शुरू करें",
    btn_explore_demo: "डेमो स्टोरी देखें",
    btn_simulate: "परिदृश्य प्रभाव का सिमुलेशन करें",
    btn_ask_ai: "AI आपातकालीन एजेंट से पूछें",
    btn_optimize_route: "सुरक्षित निकासी मार्ग खोजें",
    btn_inspect_asset: "जोखिम कारकों का विश्लेषण",
    btn_generate_report: "आकलन रिपोर्ट डाउनलोड करें",
    btn_ack_alert: "अलर्ट स्वीकार करें",
    btn_apply_weights: "जोखिम भार अपडेट करें",

    // Common labels
    search_placeholder: "नाम, जिले या आईडी से खोजें...",
    filter_district: "सभी तटीय जिले",
    filter_risk: "सभी जोखिम स्तर",
    explainable_ai_title: "व्याख्यात्मक AI (SHAP कारक योगदान)",
    recommended_actions_title: "प्राथमिक आपातकालीन निर्देश",
    baseline: "वर्तमान आधार रेखा",
    scenario: "सिम्युलेटेड परिदृश्य",
    risk_delta: "जोखिम वृद्धि"
  },

  mr: {
    app_title: "सायक्लोपाथ AI",
    tagline: "प्रभावाचा अंदाज लावा. पायाभूत सुविधांचे रक्षण करा. नागरिकांचे जीवन वाचवा.",
    subtitle: "चक्रीवादळ अंदाजापासून ते पायाभूत सुविधांच्या कृतीयोग्य माहितीपर्यंत.",
    status_operational: "प्रणाली स्थिती: पूर्णपणे कार्यरत",
    active_scenario: "सक्रिय परिस्थिती: समुद्र चक्रीवादळ (श्रेणी 4)",
    demo_badge: "डेमो सिम्युलेशन",
    disclaimer_banner: "निर्णय-सहाय्य प्रोटोटाइप: या अंदाजांची अधिकृत हवामान विभाग (IMD) आणि आपत्ती व्यवस्थापन प्राधिकरणाकडून पडताळणी करावी.",

    // Navigation
    nav_dashboard: "कमांड सेंटर",
    nav_risk_map: "धोका नकाशा",
    nav_infrastructure: "पायाभूत सुविधा",
    nav_cyclone_intel: "चक्रीवादळ माहिती",
    nav_simulator: "परिस्थिती सिम्युलेटर",
    nav_ai_agent: "AI आपत्ती प्रतिसाद एजंट",
    nav_routing: "सुरक्षित वाहतूक मार्ग",
    nav_inspector: "मल्टीमॉडल AI तपासणी",
    nav_alerts: "तातडीचे इशारे",
    nav_reports: "मूल्यमापन अहवाल",
    nav_data_sources: "माहिती स्रोत",
    nav_settings: "जोखिम इंजिन सेटिंग्ज",

    // Roles
    role_authority: "आपत्ती व्यवस्थापन प्राधिकरण",
    role_municipal: "महानगरपालिका / शासकीय अधिकारी",
    role_responder: "आपत्कालीन बचाव पथक",
    role_public: "सर्वसामान्य नागरिक",

    // Dashboard Metrics
    metric_cyclone_name: "चक्रीवादळ ट्रॅकिंग",
    metric_wind_speed: "वादळाचा वेग",
    metric_pressure: "हवेचा दाब",
    metric_movement: "हालचालीची दिशा",
    metric_landfall: "किनार्‍यावर धडकण्याची वेळ",
    metric_critical_assets: "अतिधोकादायक सुविधा",
    metric_high_risk: "उच्च जोखीम ठिकाणे",
    metric_monitored: "निरीक्षणाखालील ठिकाणे",
    metric_population_exposed: "अंदाजे बाधित लोकसंख्या",
    metric_shelters_active: "सक्रिय चक्रीवादळ निवारा",
    metric_storm_surge: "लाटांची अपेक्षित उंची",
    metric_rainfall: "२४ तासांतील पर्जन्यमान",

    // Infrastructure Types
    type_all: "सर्व पायाभूत सुविधा",
    type_hospital: "रुग्णालये",
    type_power: "विद्युत सबस्टेशन",
    type_bridge: "पूल",
    type_road: "महामार्ग व रस्ते",
    type_shelter: "निवारा केंद्रे",
    type_water: "पाणीपुरवठा प्रकल्प",
    type_port: "बंदरे",

    // Risk Levels
    risk_critical: "अतिगंभीर",
    risk_high: "उच्च धोका",
    risk_moderate: "मध्यम",
    risk_low: "कमी धोका",

    // Action Buttons
    btn_launch_command: "कमांड सेंटर सुरू करा",
    btn_explore_demo: "डेमो पहा",
    btn_simulate: "परिणामांचे सिम्युलेशन करा",
    btn_ask_ai: "AI एजंटचा सल्ला घ्या",
    btn_optimize_route: "सुरक्षित मार्ग शोधा",
    btn_inspect_asset: "धोक्याचे घटक तपासा",
    btn_generate_report: "अहवाल डाऊनलोड करा",
    btn_ack_alert: "इशारा नोंदवला",
    btn_apply_weights: "जोखीम घटक अद्ययावत करा",

    // Common labels
    search_placeholder: "नाव, जिल्हा किंवा आयडीने शोधा...",
    filter_district: "सर्व किनारपट्टी जिल्हे",
    filter_risk: "सर्व जोखीम स्तर",
    explainable_ai_title: "स्पष्टीकरणात्मक AI (घटकांचे योगदान)",
    recommended_actions_title: "प्राधान्य आपत्कालीन कृती",
    baseline: "सध्याची स्थिती",
    scenario: "सिम्युलेशन स्थिती",
    risk_delta: "धोका वाढ"
  }
};
