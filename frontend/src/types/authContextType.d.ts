export interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
    userDetails: {} | null;
    setUserDetails: (detail: {} | null) => void;
    authReady?: boolean;
}