// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const msg = req.query.text ? req.query.text : ''
    if(global.Whatsapp){
      const data = await  Whatsapp.sendText('5511960655281@c.us', msg as string)
      res.status(200).json(data)
    }else{
      res.status(501).json({
        error: 'Whatsapp not connected'
      })
    } 
    
}
