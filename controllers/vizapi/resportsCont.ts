import { Request, Response } from 'express';


export const salesbysectionbyyear = async ( req:Request, resp:Response) => {
    resp.json({
        msg:"Great!!"
    });
}