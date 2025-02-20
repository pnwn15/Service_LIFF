import C_BottomNav from "@/components/c_Bottom-Nav"

export default function Layout({ children }) {
    return (
        <>
            <C_BottomNav >
        {children}
            </C_BottomNav >
        </>
    )
}