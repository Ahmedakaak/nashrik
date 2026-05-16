import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from '../locales/en.json'
import ar from '../locales/ar.json'

const syncDocumentDirection = (language) => {
    const normalizedLanguage = language?.split('-')[0]

    document.documentElement.dir = normalizedLanguage === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = normalizedLanguage || 'en'
}

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            ar: { translation: ar },
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    })

syncDocumentDirection(i18n.language)
i18n.on('languageChanged', syncDocumentDirection)

export default i18n
