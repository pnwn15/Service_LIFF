'use client';

import { useEffect } from 'react';
import { Button } from 'antd';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    

    return (
        <div className='flex justify-center items-center w-screen h-screen'>
            <div className="flex flex-col justify-center items-center gap-3 font-bold">
            <h2>Something went wrong!</h2>
            <Button  onClick={() => reset()}>Try Again</Button>
            </div>
        </div>
    );
}
