/* eslint-disable @typescript-eslint/no-unused-vars */
type ThemeColors = "Zinc" | "Rose" | "Blue" | "Green" | "Orange"
interface ThemeColorStateParams{
    themeColor: ThemeColors;
    setThemeColor: React.Dispatch<React.SetStateAction<ThemeColors>> 
}