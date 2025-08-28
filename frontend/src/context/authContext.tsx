import React, { createContext, useContext } from "react";
import type { AuthContextType } from "../types/authContextType";

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    return useContext(AuthContext);
}
export const AuthContextProvider: React.Provider<AuthContextType> = AuthContext.Provider