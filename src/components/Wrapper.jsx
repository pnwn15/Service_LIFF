"use client"
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { getUser } from '@/lib/userManipulate';

function Wrapper() {
    const router = useRouter()

          useEffect(() => {
        checkLogin()
    }, [])

    const checkLogin = async ()  => {
            try {
                const user = await getUser()
                // console.log('user', user)
              

                // console.log('user', user)
                if (!user) {
                  router.push('/login')

                } else {
                    router.push(`/${user.Internal?"technician":"customer"}/task`)
                }
            }
            catch (error) {
                console.log("error : ", error)
                router.push('/login')
            }

     
    }


}

export default Wrapper