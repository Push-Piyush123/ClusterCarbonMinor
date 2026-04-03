declare module '*/services/authService' {
    const authService: any;
    export default authService;
}

declare module '*/services/clusterService' {
    const clusterService: any;
    export default clusterService;
}

declare module '*/services/dashboardService' {
    const dashboardService: any;
    export default dashboardService;
}

declare module '*/services/emissionService' {
    const emissionService: any;
    export default emissionService;
}

declare module '*/services/msmeService' {
    const msmeService: any;
    export default msmeService;
}

declare module '*/services/riskAllocationService' {
    const riskAllocationService: any;
    export default riskAllocationService;
}

declare module '*/services/apiClient' {
    import { AxiosInstance } from 'axios';
    const apiClient: AxiosInstance;
    export default apiClient;
}
