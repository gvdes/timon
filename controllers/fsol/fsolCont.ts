import { Request, Response } from 'express'
import accdb from 'node-adodb'
import moment from 'moment';
import { Op } from "sequelize";

import WorkpointMD from '../../models/WrkpointsMD';
import { wkpRequest, wkpConnection } from '../vizapi/HelpresCont';

const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);

export const SYNCCLIENTS = async( req:Request, resp:Response)=>{
    console.log("Iniciando sincronizacion de clientes..");
    const wkpreq = req.body.sucursal;
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
            console.log(cllength);

            if(cllength){
                rows = clrows.map( (cl:any) => { // formateando las filas
                                if(cl.TARCLI == 7){ cl.TARCLI=6; cambiosdetarifa.push({cliente:cl.NOFCLI,codigo:cl.CODCLI}); }
                                resumen.clientes.push(`${moment(cl.FUMCLI).format("YYYY/MM/DD")} ==> ${cl.CODCLI} ${cl.NOFCLI}, TAR: ${cl.TARCLI}`);
                                return cl;
                            });

                if(command=="ver"){// opcion para solo visualizar
                    return resp.json({"accion":command,inicio:from,fin:to,resumen,cambiosdetarifa});
                }

                if(command=="sync"){//opcion para sincronizar
                    if(wkpreq){// si solo se solicita la actualizacion en una tienda
                        const wkp:any = await WorkpointMD.findOne({ where:
                            {
                                [Op.or]:[
                                    { id:wkpreq },
                                    { alias:wkpreq }
                                ]
                            } 
                        });

                        if(wkp&&wkp.active==1){// validate workpoint existence and this is active
                            const con:any = await wkpConnection(wkp);//test to knows there are connection
                
                            if(con.state){//if there are conection
                                console.log("Conexion exitosa");
                                const action:any = await wkpRequest(wkp,{rows},"/fsol/sync/clients","POST");
                                const PING = `${wkp.alias} ==> OK!!`;
                                console.log(PING,action);
                                resp.json({wkp,con,action});// send response about request
                            }else{ resp.status(502).json({wkp,con}); }// if there arent response, return a error server
                        }else{
                            resp.status(400).json({"No hables tus mierdas meriyein":wkp?`esta sucursal no esta activa (y-_-)y`:`${wkpreq} ni existe (y-_-)y`});//if there are connection, return error server
                        }
                    }else{// si la actualizacion debe ser completa (en todas las tiendas)
                        const workpoints = await WorkpointMD.findAll();
                        const wkps:Array<any> = JSON.parse(JSON.stringify(workpoints)).filter( (w:any) => (w.active&&w.id>2) );

                        for await (const wkp of wkps) {
                            const con:any = await wkpConnection(wkp);
                            
                            if(con.state){
                                const action:any = await wkpRequest(wkp,{rows},"/fsol/sync/clients","POST");
                                const PING = `${wkp.alias} ==> OK!!`;
                                console.log(PING,action);
                                resumen.goals.push({PING}, action);
                            }else{
                                const PING = `${wkp.alias} ==> REJECT!!`;
                                resumen.fails.push({PING});
                            }
                        }

                        return resp.json({"accion":command,inicio:from,fin:to,resumen,cambiosdetarifa});
                    }
                }
            }else{
                resumen.clientes = "Nada por actualizar";
                return resp.json({resumen});
            }
        } catch (error) { }

    }else{ return resp.status(400).json({error:`${command} no es una accion valida utiliza VER para visualizar o SYNC para actualizar`}); }
};

export const SYNCPRODSFAMS = async(req:Request, resp:Response )=>{
    const wkpreq = req.body.sucursal;
    const fecha = req.body.fecha;
    const accion = req.body.accion;
    let qday = moment().format('YYYY/MM/DD');
    let resumen:any = { goals:[], fails:[] };

    if(fecha){// recibi contenido en la variable fecha
        //la fecha es una fecha valida
        if(fecha.length==10&&moment(fecha,"YYYY/MM/DD").isValid()){
            qday=fecha;// nueva fecha a considerar
        }else{//la fecha no es valida, notificar al cliente
            return resp.status(400).json({"meriyein":`La fecha: ${fecha}, no es una fecha valida (y-_-)y`});
        }
    }

    //ejecucion de query
    const rows:Array<any> = await fsol.query(
        `SELECT F_EAN.* FROM F_EAN
        INNER JOIN F_ART ON F_ART.CODART = F_EAN.ARTEAN
        WHERE F_ART.FUMART>=#${qday}#;`
    );

    if (accion&&accion=="sync") {//validacion del comando recibido
        if(rows.length){//hay registros en este periodo de fecha
            if(wkpreq){//actualizacion individual
                const wkp:any = await WorkpointMD.findOne({ where:
                    {
                        [Op.or]:[
                            { id:wkpreq },
                            { alias:wkpreq }
                        ]
                    } 
                });

                if(wkp&&wkp.active==1){// validate workpoint existence and this is active
                    const con:any = await wkpConnection(wkp);//test to knows there are connection
                
                    if(con.state){//if there are conection
                        console.log("Conexion exitosa");
                        const action:any = await wkpRequest(wkp,{rows},"/fsol/sync/familiarizations","POST");
                        const PING = `${wkp.alias} ==> OK!!`;
                        console.log(PING,action);
                        resp.json({wkp,con,action});// send response about request
                    }else{ return  resp.status(502).json({wkp,con}); }// if there arent response, return a error server
                }else{
                    return resp.status(400).json({"meriyein":wkp?`esta sucursal no esta activa (y-_-)y`:`${wkpreq} ni existe (y-_-)y`});//if there are connection, return error server
                }

            }else{// actualizacion masiva, a todas las tiendas
                const workpoints = await WorkpointMD.findAll();
                const wkps:Array<any> = JSON.parse(JSON.stringify(workpoints)).filter( (w:any) => (w.active&&w.id>2) );
    
                for await (const wkp of wkps) {
                    const con:any = await wkpConnection(wkp);
                    
                    if(con.state){
                        const action:any = await wkpRequest(wkp,{rows},"/fsol/sync/familiarizations","POST");
                        const PING = `${wkp.alias} ==> OK!!`;
                        console.log(PING,action);
                        resumen.goals.push({PING}, action);
                    }else{
                        const PING = `${wkp.alias} ==> REJECT!!`;
                        resumen.fails.push({PING});
                    }
                }
        
                return resp.json({resumen});
            }
        }else{ return resp.json({"meriyein":"Sin familiarizaciones disponibles"}); }
    }else{//el comando no es sync, se devuelven las filas para visualizarlas
        return rows.length ?
            resp.json({fecha,familiarizaciones:rows}):
            resp.json({"meriyein":"Sin familiarizaciones aqui!!"});
    }
};

export const LISTCLIENTS = async(req:Request, resp:Response) => {
    const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);
    
    try {
        let clients:Array<Object> = await fsol.query(`SELECT * FROM F_CLI`);
        resp.json({ clients });
    } catch (error) {
        resp.status(500).json(error);
    }
};

export const SYNCAGENTS = async(req:Request, resp:Response) => {
    console.log("Iniciando sincronizacion de Agentes...");
    const wkpreq = req.body.sucursal;
    const today = moment().format('YYYY/MM/DD'); // se obtiene la fecha del dia en curso
    const rangedates = req.body.periodo||null; // desde
    const command = req.body.accion||"ver"; // desde
    let from = undefined; // desde
    let to = undefined;// hasta
    let qagents = `SELECT * FROM F_AGE WHERE FALAGE=#${today}#;`;// query por default a ejecutar
    let qdeps = `SELECT T_DEP.* FROM T_DEP INNER JOIN F_AGE ON F_AGE.CODAGE = T_DEP.CODDEP WHERE F_AGE.FALAGE=${today}#`;// query por default a ejecutar
    let resumen:any = { goals:[], fails:[] };

    try {

        if(command=="ver"||command=="sync"){
            if(rangedates){
                if(rangedates.inicio&&rangedates.inicio.length==10&&moment(rangedates.inicio,"YYYY/MM/DD").isValid()){
                    from = rangedates.inicio;
                    if(rangedates.fin){
                        if(rangedates.fin.length==10&&moment(rangedates.fin,"YYYY/MM/DD").isValid()){
                            to = rangedates.fin;
                        }else{ return resp.status(400).json({"Error":`La fecha de fin no es una fecha valida, utiliza el siguiente formato: AAAA/MM/DD (ej. 2001/01/15)`}); }
                    }else{ to=today; }
                }else{ return resp.status(400).json({"Error":`La fecha de inicio no es una fecha valida, utiliza el siguiente formato: AAAA/MM/DD (ej. 2001/01/15)`}); }
    
                qagents = `SELECT * FROM F_AGE WHERE FALAGE Between #${from}# and #${to}#;`;
                qdeps = `SELECT T_DEP.* FROM T_DEP INNER JOIN F_AGE ON F_AGE.CODAGE = T_DEP.CODDEP WHERE F_AGE.FALAGE Between #${from}# and #${to}#;`;
            }else{
                from = today; // desde
                to = today;// hasta
            }

            let rset_agentes:Array<any> = await fsol.query(qagents);
            let rset_dependientes:Array<any> = await fsol.query(qdeps);

            if(rset_agentes.length || rset_dependientes.length){
                let agentes = rset_agentes.map( a => `${a.CODAGE}::${a.NOMAGE}::${a.FALAGE}`);
                let dependientes = rset_dependientes.map( d => `${d.CODDEP}::${d.NOMDEP}::${d.CLADEP}`);

                console.log(`Agentes por sincronizar ==> ${agentes.length}`);

                if(command=="ver"){
                    return resp.json({command,inicio:from,fin:to,resumen:{agentes,dependientes}});
                }

                if(command=="sync"){
                    if(wkpreq){// si solo se solicita la actualizacion en una tienda
                        const wkp:any = await WorkpointMD.findOne({ where:
                            {
                                [Op.or]:[
                                    { id:wkpreq },
                                    { alias:wkpreq }
                                ]
                            } 
                        });

                        if(wkp&&wkp.active==1){// validate workpoint existence and this is active
                            const con:any = await wkpConnection(wkp);//test to knows there are connection
                
                            if(con.state){//if there are conection
                                console.log(`Actualizando agentes en ${wkp.alias}...`);
                                const action:any = await wkpRequest(wkp,{ rset_agentes, rset_dependientes },"/fsol/sync/agents","POST");
                                console.log(`Actualizacion de agentes finalizada en ${wkp.alias}...`);
                                resp.json({command,inicio:from,fin:to,action});// send response about request
                            }else{ resp.status(502).json({wkp,con}); }// if there arent response, return a error server
                        }else{
                            //if there are connection, return error server
                            resp.status(400).json({"No hables tus mierdas meriyein":wkp?`esta sucursal no esta activa (y-_-)y`:`${wkpreq} ni existe (y-_-)y`});
                        }
                    }else{
                        const workpoints = await WorkpointMD.findAll();
                        const wkps:Array<any> = JSON.parse(JSON.stringify(workpoints)).filter( (w:any) => (w.active&&w.id>2) );

                        for await (const wkp of wkps) {
                            const con:any = await wkpConnection(wkp);
                            
                            if(con.state){
                                console.log(`Actualizando agentes en ${wkp.alias}...`);
                                const action:any = await wkpRequest(wkp,{ rset_agentes, rset_dependientes },"/fsol/sync/agents","POST");
                                console.log(`Actualizacion de agentes finalizada en ${wkp.alias}...`);
                                resumen.goals.push(action);
                            }else{
                                const PING = `${wkp.alias} ==> REJECT!!`;
                                resumen.fails.push({PING});
                            }
                        }
                        console.log(`Actualizacion de agentes finalizada!!!`);
                        resp.json({command, inicio:from, fin:to, resumen});// send response about request
                    }
                }
            }else{ return resp.json({"msg":"Nada por Actualizar!","accion":command,inicio:from,fin:to,rset_agentes,rset_dependientes}); }

        }else{ return resp.status(400).json({error:`${command} no es una accion valida utiliza VER para visualizar o SYNC para actualizar`}); }
    } catch (error) { resp.status(500).json(error); }
}