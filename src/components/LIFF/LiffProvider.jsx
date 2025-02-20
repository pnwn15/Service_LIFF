"use client"

import liff from "@line/liff";
import { useEffect, useState } from "react";
import LiffContext from "./LiffContext";

export default function LiffProvider({ children }) {

    const [LIFF, setLIFF] = useState(null);

    useEffect(() => {

        const originalFetch = window.fetch;
        function customFetch(url, options) {
            if (url.toString().startsWith('https://liffsdk.line-scdn.net/xlt/') && url.toString().endsWith('.json')) {
                url = url + '?ts=' + Math.random()
            }
            return originalFetch(url, options)
        }
        window.fetch = customFetch;

        liff.init({
            liffId: process.env.NEXT_PUBLIC_LIFF_ID, // Use own liffId
        }).then(
            () => { setLIFF(liff) }
        ).catch((err) => {
            console.error(err);
        });

    }, [])
    return (
        <>
            <LiffContext.Provider value={{ LIFF }}>
                {children}
            </LiffContext.Provider>
        </>
    )
}