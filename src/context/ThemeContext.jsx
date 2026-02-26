import { createContext, useContext, useLayoutEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

    const [theme, setTheme] = useState("light");

    useLayoutEffect(() => {

        const savedTheme = localStorage.getItem("theme");

        const root = document.documentElement;

        if (savedTheme === "dark") {
            root.classList.add("dark");
            setTheme("dark");
        } else {
            root.classList.remove("dark");
            setTheme("light");
        }

    }, []);

    const toggleTheme = () => {

        const root = document.documentElement;

        if (theme === "dark") {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setTheme("light");
        } else {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setTheme("dark");
        }

    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
