import { Request, Response} from 'express';
import AccountMD from '../../models/AccountMD'
import WorkpointMD from '../../models/WrkpointsMD';

const build = async( req:Request, resp:Response ) => {
    const newuser = AccountMD.build( { nick:"Gaby", password:"123456789" } );
    
    resp.json({ newuser });
}

const all = async( req:Request, resp:Response ) => {
    const accounts = await AccountMD.findAll({
        attributes: { exclude:['password'] }
    });
    resp.json({ accounts });
}

const onWorkpoint = async(req:Request, resp:Response) => {
    const wkp = 5;
    // const accounts = await AccountMD.findAll({
    //     where:{ "_wp_principal":wkp },
    //     attributes: { exclude:['password'] }
    // });
    // console.log( accounts );
    // resp.json({ accounts });

    try {
        const accounts = await WorkpointMD.hasMany(AccountMD,{
            foreignKey:"_wp_principal"
        });
        console.log(accounts);
        resp.json({ accounts });
    } catch (error) {
        console.log(error);
        resp.status(500).json({ error });
    }
}

export default { build, all, onWorkpoint }