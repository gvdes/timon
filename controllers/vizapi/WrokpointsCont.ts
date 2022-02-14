import { Request, Response } from 'express';
import WorkpointMD from '../../models/WrkpointsMD';

const all = async( req:Request, resp:Response ) => {
    const workpoints = await WorkpointMD.findAll();
    resp.json({ workpoints });
}

export default { all }