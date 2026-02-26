import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
    English: {
        dashboard: 'Dashboard',
        revenue: 'Revenue',
        notifications: 'Notifications',
        search: 'Search products, orders, or customers...',
        welcome: 'Welcome',
        guest: 'Guest',
        offline: 'Offline',
        dark_mode: 'Dark Mode',
        light_mode: 'Light Mode',
    },
    Hindi: {
        dashboard: 'डैशबोर्ड',
        revenue: 'राजस्व',
        notifications: 'सूचनाएँ',
        search: 'उत्पाद, ऑर्डर या ग्राहक खोजें...',
        welcome: 'स्वागत है',
        guest: 'अतिथि',
        offline: 'ऑफ़लाइन',
        dark_mode: 'डार्क मोड',
        light_mode: 'लाइट मोड',
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => {
        const savedLanguage = localStorage.getItem('language');
        return savedLanguage || 'English';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const toggleLanguage = () => {
        setLanguage((prevLang) => (prevLang === 'English' ? 'Hindi' : 'English'));
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
