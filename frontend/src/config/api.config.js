export const API_CONFIG = {
  BASE_URL: "http://localhost:5000",
  ENDPOINTS: {
    // Emissions
    EMISSIONS_CALCULATE: "/emissions/calculate-cluster",
    EMISSIONS_GET_CLUSTER: "/emissions/cluster/:clusterId",
    EMISSIONS_GET_MSME: "/emissions/msme/:msmeId",
    EMISSIONS_GET_SUMMARY: "/emissions/summary",
    EMISSIONS_ISSUE: "/emissions/issue-cluster/:clusterId",
    EMISSIONS_VERIFY: "/emissions/verify/:emissionSummaryId",
    
    // Risk & Allocation
    RISK_CALCULATE: "/risk-allocation/calculate-risks",
    RISK_ALLOCATE: "/risk-allocation/allocate",
    RISK_GET_CLUSTER: "/risk-allocation/cluster/:clusterId",
    RISK_GET_MSME: "/risk-allocation/msme/:msmeId",
    RISK_GET_SUMMARY: "/risk-allocation/summary",
    RISK_GET_RISK_SCORES: "/risk-allocation/risk-scores/:clusterId",
    RISK_VERIFY: "/risk-allocation/verify/:allocationId",
    RISK_CLAIM: "/risk-allocation/claim/:allocationId",

    // Dashboard
    DASHBOARD_SYSTEM_METRICS: "/dashboard/system-metrics",
    DASHBOARD_CLUSTER: "/dashboard/cluster/:clusterId",
    DASHBOARD_MSME: "/dashboard/msme/:msmeId",
    DASHBOARD_VERIFICATION_QUEUE: "/dashboard/verification-queue",
    DASHBOARD_SUMMARY: "/dashboard/summary",
    DASHBOARD_DATA_QUALITY: "/dashboard/data-quality",
    DASHBOARD_EXPORT_CSV: "/dashboard/export/csv",
    DASHBOARD_EXPORT_PDF: "/dashboard/export/pdf"
  }
};
