import React, { createContext, useContext } from "react";
import type { AuthContextType } from "../types/authContextType";

const AuthContext = createContext<AuthContextType>({
    token: null,
    setToken: () => { },
    userDetails: null,
    setUserDetails: () => { }
});

export const useAuth = () => {
    return useContext(AuthContext);
}
export const AuthContextProvider: React.Provider<AuthContextType> = AuthContext.Provider