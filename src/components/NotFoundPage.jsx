import { Button } from 'antd'
import React from 'react'

function NotFoundPage() {
  return (
      <div className='flex justify-center items-center h-screen w-screen '>

          <div className='flex flex-col font-bold justify-center items-center gap-2'>
                <div className="font24">404</div>
                <div className="font24">Not Found!</div>
                <Button type="primary" href="/">Back to Home</Button>
          </div>
          

          
      </div>
  )
}

export default NotFoundPage