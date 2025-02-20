"use client"

import React,{ useEffect,useContext,useState } from "react"
import LiffContext from "@/components/LIFF/LiffContext"


export default function QRPage(){
    const { LIFF } = useContext(LiffContext);
    const [text ,setText] = useState("");
    useEffect(() => {
        if (LIFF) {
            LIFF.scanCodeV2()
                .then((result) => {
                    // e.g. result = { value: 'Hello LIFF app!' }
                })
                .catch((err) => {
                    setText(err.toString());
                    console.log(err);
                });
        }
    }, [LIFF]);


return(
    <>
        {text}

    </>
)

}