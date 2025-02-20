import { useContext } from 'react';
import LiffContext from "./LIFF/LiffContext";


export async  function Scanner() {

    const { LIFF } = useContext(LiffContext);

    console.log('scanning');
    if (LIFF) {
        if (LIFF.isLoggedIn()) {
            await LIFF.scanCodeV2()//QQR sacnner
                .then(async (result) => {
                    if (result.value) {
                        LIFF.CloseWindow()
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }
}

