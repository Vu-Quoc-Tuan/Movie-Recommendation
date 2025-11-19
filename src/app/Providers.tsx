import {ThemeProvider} from "../components/ui/ThemeProvider";
import {AuthProvider} from "../components/auth/AuthContext";


export function AppProviders({ children }: { // @ts-ignore
    children: React.ReactNode }) {
    return (
        <ThemeProvider children={undefined}>
            <AuthProvider children={undefined}>
                {children}
            </AuthProvider>
        </ThemeProvider>
    );
}