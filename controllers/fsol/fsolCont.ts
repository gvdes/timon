import { Request, response, Response } from 'express'
import accdb from 'node-adodb'
import moment from 'moment';

import WorkpointMD from '../../models/WrkpointsMD';
import { wkpRequest, wkpConnection } from '../vizapi/HelpresCont';

const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);

export const SYNCCLIENTS = async( req:Request, resp:Response)=>{
    console.log("Iniciando sincronizacion de clientes..");
    let cambiosdetarifa:Array<Object> = [];
    const today = moment().format('YYYY/MM/DD'); // se obtiene la fecha del dia en curso
    let query = `SELECT * FROM F_CLI WHERE FUMCLI=#${today}#;`;// query por default a ejecutar
    const rangedates = req.body.periodo||null; // desde
    const command = req.body.accion||"ver"; // desde
    let from = undefined; // desde
    let to = undefined;// hasta
    let cllength = 0;
    let resumen:any = { clientes:[], goals:[], fails:[] };
    let rows:any =[];

    if(command=="ver"||command=="sync"){
        if(rangedates){
            if(rangedates.inicio&&rangedates.inicio.length==10&&moment(rangedates.inicio,"YYYY/MM/DD").isValid()){
                from = rangedates.inicio;
                if(rangedates.fin){
                    if(rangedates.fin.length==10&&moment(rangedates.fin,"YYYY/MM/DD").isValid()){
                        to = rangedates.fin;
                    }else{
                        return resp.status(400).json({"Error":`La fecha de fin no es una fecha valida, utiliza el siguiente formato: AAAA/MM/DD (ej. 2001/01/15)`});
                    }
                }else{ to=today; }
            }else{
                return resp.status(400).json({"Error":`La fecha de inicio no es una fecha valida, utiliza el siguiente formato: AAAA/MM/DD (ej. 2001/01/15)`});
            }

            query = `SELECT * FROM F_CLI WHERE FUMCLI Between #${from}# and #${to}#;`;
        }else{
            from = today; // desde
            to = today;// hasta
        }

        try {
            let clrows:Array<Object> = await fsol.query(query); // se ejecuta el query y se obtienen filas
            cllength = clrows.length; //tamaño de las filas

            if(cllength){
                rows = clrows.map( (cl:any) => { // formateando las filas
                                if(cl.TARCLI == 7){ cl.TARCLI=6; cambiosdetarifa.push({cliente:cl.NOFCLI,codigo:cl.CODCLI}); }
                                resumen.clientes.push(`${moment(cl.FUMCLI).format("YYYY/MM/DD")} ==> ${cl.CODCLI} ${cl.NOFCLI}, TAR: ${cl.TARCLI}`);
                                return cl;
                            });

                if(command=="ver"){
                    return resp.json({"accion":command,inicio:from,fin:to,resumen,cambiosdetarifa});
                }

                if(command=="sync"){
                    const workpoints = await WorkpointMD.findAll();
                    const wkps:Array<any> = JSON.parse(JSON.stringify(workpoints)).filter( (w:any) => (w.active&&w.id>2) );

                    for await (const wkp of wkps) {
                        const con:any = await wkpConnection(wkp);
                        
                        if(con.state){
                            const action:any = await wkpRequest(wkp,{rows},"/fsol/sync/clients","POST");
                            const PING = `${wkp.alias} ==> OK!!`;
                            console.log(PING,action);
                            resumen.goals.push(`${wkp.alias} ==> PING OK!!`, action);
                        }else{
                            const PING = `${wkp.alias} ==> REJECT!!`;
                            resumen.fails.push(PING); }
                    }

                    return resp.json({"accion":command,inicio:from,fin:to,resumen,cambiosdetarifa});
                }
            }else{
                resumen.clientes = "Nada por actualizar";
                return resp.json({resumen});
            }
        } catch (error) {
            
        }

    }else{ return resp.status(400).json({error:`${command} no es una accion valida utiliza VER para visualizar o SYNC para actualizar`}); }
};

export const LISTCLIENTS = async(req:Request, resp:Response) => {
    const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
    
    try {
        let clients:Array<Object> = await fsol.query(`SELECT * FROM F_CLI`);
        resp.json({ clients });
    } catch (error) {
        resp.status(500).json(error);
    }
}