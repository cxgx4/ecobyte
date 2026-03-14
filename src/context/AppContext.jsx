import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [theme, setTheme] = useState("dark");
    const [location, setLocation] = useState({ longitude: 88.3639, latitude: 22.5726 });
    const [user, setUser] = useState("Suhena Samanta");

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    };

    return (
        <AppContext.Provider value={{ theme, toggleTheme, location, setLocation, user, setUser }}>
            {children}
        </AppContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = () => useContext(AppContext);
