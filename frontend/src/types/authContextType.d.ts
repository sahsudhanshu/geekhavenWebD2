export interface AuthContextType {
    token: string | null;
    setToken: (token: string | null) => void;
}