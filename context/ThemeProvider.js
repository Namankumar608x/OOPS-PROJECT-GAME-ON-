import { createContext, useContext, useState } from "react"
const ThemeContext = createContext({theme:"light" ,toggleTheme:()=>{}});
export const useTheme =()=> useContext(ThemeContext)
const ThemeProvider=({children})=>{
    const[theme ,setTheme]= useState("light");
    const toggleTheme=(prev)=>{
        setTheme(prev==="light"?"dark":"light");
    }
    return <ThemeContext.Provider value={{theme,toggleTheme}}>
        {children}
    </ThemeContext.Provider>
}
export default ThemeProvider;