import { Request, Response} from 'express';
import net from 'net';
import http from 'http';
import { Op } from "sequelize";

import vizapi from '../../db/vizapi';
import ProductMD from '../../models/Product';// modelo de Products
import WorkpointMD from '../../models/WrkpointsMD';// modelo de WorkPoints
import ProductLocationsMD from '../../models/ProductLocationsMD';// modelo de Producto vs ubicacion
import WarehouseSectionMD from '../../models/WarehouseSectionsMD';// modelo de Secciones de almacen

/**
 * @param wkp contains the host, port and all of about the workpoint such name, alias, etc
 * @param timeout time the promise will take to resolve
 * @returns A promise that always resolve an state true||false about de server status (meaning if server is on or off)
 */
export const wkpConnection = async (wkp:any, timeout:number=1000) =>{
    return new Promise( (resolve,reject) =>{
        const env = process.env.MODE||"dev";
        const domain = wkp.dominio.split(":");// enabled just in production mode
        const host = env=="dev"?"localhost":domain[0];
        const alias = wkp.alias;
        const port = 44140;// domain[1] --> puerto
        // const host=domain[0], port=44140, alias=wkp.alias; // just for production mode

        const timer = setTimeout(()=>{
            resolve({state:false,resume:`${alias} ==> ${host}:${port} ==> TIMEOUT !!!`});
        }, timeout);

        const socket = net.createConnection(port, host, ()=>{
            clearTimeout(timer);
            socket.end();
            resolve({state:true,wkp,resume:`${alias} ==> ${host}:${port} ==> DONE !!!`});
        });

        socket.on('error', (err)=>{
            console.log(err.message);
            clearTimeout(timer);
            socket.end();
            resolve({state:false,err,resume:`${alias} ==> ${host}:${port} ==> FAIL !!!`});
        });
    });
}

/**
 * @param wkp: Contains the info about the server workpoint such name, alias, etc 
 * @param method: Method of request, default is GET
 * @param path: Request route
 * @param data: data into the object to send in request, it will always be an object
 * @returns: A promise that always resolves results of remote API
 */
export const wkpRequest = async (wkp:any,data:object={},path:string="/fsol/ping",method:string="GET") => {
    return new Promise((resolve,reject)=>{
        let env = process.env.MODE||"dev";
        const domain = wkp.dominio.split(":");

        const host = env=="dev"?"localhost":domain[0];
        const alias = wkp.alias;
        const port = 44140;// domain[1] --> puerto

        console.log("Sending REQUEST to:",`${host}:${port}`,alias,"...");
        const dataSend = JSON.stringify(data);
        const options = {
            host: host,
            port: port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(dataSend)
            }
        };

        try {
            const remotereq = http.request(options, (remoteresp) => {
                remoteresp.setEncoding('utf8');
                remoteresp.on('data', (chunk) => {
                    console.log("Response from remote server: ");
                    try {
                        let resconv = JSON.parse(chunk);
                        resolve({state:true,wkpresp:resconv});
                    } catch (error) {
                        resolve({state:false,wkpresp:"PUMBA no devolvio una respuesta valida, revise que esté instalado, esté activo y que el puerto de conexion esté disponible"});
                    }
                });
            });
            
            remotereq.on('error', error =>{
                const ERROR = {
                    wkpresp:"PUMBA no devolvio una respuesta valida, revise que esté instalado, esté activo y que el puerto de conexion esté disponible",
                    state:false,
                    error:`${alias} ==> ${error.message}`
                };
                console.log(error);
                resolve(ERROR);
            });
            remotereq.write(dataSend);
            remotereq.end();
        } catch (error) {
            console.log(error);
            resolve({state:false,error});
        }
    });
}

/**
 * @function: this function it will try make a ping and request for eachone workpoints to know if server its on and responds to requests
 * @returns: it will return an object that contains workpoints (servers) status
 */
export const PINGS = async ( req:Request,resp:Response) =>{
    const wkpreq = req.body.sucursal;

    if(wkpreq){// puede resivir una sucursal
        // look for workpoint to do the tests
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
                const remoteresp = await wkpRequest(wkp,{wkp});// try make a request (the first wkp is to do test conection, second wkp is for show in console)
                resp.json({wkp,con,remoteresp});// send response about request
            }else{ resp.status(502).json({wkp,con}); }// if there arent response, return a error server
        }else{
            resp.status(400).json({"No hables tus mierdas meriyein":wkp?`esta sucursal no esta activa (y-_-)y`:`${wkpreq} ni existe (y-_-)y`});//if there are connection, return error server
        }
    }else{// if workpoint missing, it will iterate al workpoints
        const wkpsQuery = await WorkpointMD.findAll();//obtiene todas las sucursales
        const wkps:Array<any> = JSON.parse(JSON.stringify(wkpsQuery)).filter( (w:any) => (w.active&&w.id!=1) );//filtra las sucursales a iterar
        const resume:any = { short:[], on:[], off:[] };

        try {
            for await (const wkp of wkps) {// workpoints iterate
                const con:any = await wkpConnection(wkp);//test to know if there are connection 
                console.log(con.resume);
                resume.short.push(con.resume);// ad short resume as good response

                if(con.state){//check if connection was exit
                    resume.on.push({conection:true,wkp,api:null});
                    const remoteresp = await wkpRequest(wkp,{wkp});//the first wkp is to do test conection, second wkp is for show in console
                    console.log(remoteresp);
                }else{
                    resume.off.push({conection:false,wkp,api:null});
                }
            }
            
            resp.json({resume});
        } catch (error) { resp.status(500).json({resume}); }
    }
}

export const MASSIVELOCATIONS = async(req:Request,resp:Response)=>{
    console.log("Ubicaciones masivas iniciada...");
    let rows:Array<any> = req.body.rows; // filas que se resiven desde el cliente (filas del excel)
    let idwrh:number = req.body.idwrh; // id del almacen sobre el que se va a trabajar
    const replace:Boolean = req.body.replace ?? false;

    let productosNoEncontrados = []; // store para almacen de productos encontrados y no encontrados
    let ubicacionesNoEncontradas = [];// almacen de ubicaciones encontradas y no encontradas
    let filasvacias = [];//almacen para filas que no tienen 

    let porunir=[]; // almacen para posibles uniones
    let uniones:any={ exitosas:[], erroneas:[] }; // uniones completadas y uniones que fracasaron
    let desuniones:any=[];//almacena las desuniones realizadas
    let yaestaban=[]; // uniones que ya existian

    for await (const row of rows) {// iteracion de filas del excel para asociar producto vs ubicacion(es)
        if(row.code&&row.location){
            const prod = await ProductMD.findOne({ where:{ code:row.code } });// busqueda del producto

            if(prod){
                const product = JSON.parse(JSON.stringify(prod));// parseo del producto encontrado
                const paths = row.location.split(",");// obtencion de las ubicaciones a asociar (viene separads por coma desde el excel)
                
                if(replace){// eliminar las ubicaciones actuales del producto en cualquiera de los almacenes de la sucursal recibida
                    const [results]:any = await vizapi.query(`
                        DELETE PL FROM product_location PL
                            INNER JOIN celler_section CS ON CS.id=PL._location
                            INNER JOIN celler C ON C.id=CS._celler
                            INNER JOIN products P ON P.id=PL._product
                            INNER JOIN workpoints W ON W.id=C._workpoint
                        WHERE W.id=${idwrh} AND P.code="${product.code}";
                    `);
                    if(results.affectedRows>0){ desuniones.push({ product:product.code, locs:results.affectedRows }); }
                }

                for await(const path of paths) {// recorrer unicaciones spliteadas
                    const location:any = await WarehouseSectionMD.findOne({ where:{path,_celler:idwrh} });// se valida laexistencia de la ubicacion
                    location ? 
                        porunir.push({ code:product.code, _product:product.id, _location:location.id,path }):// producto y ubicacion que si pueden asociadas
                        ubicacionesNoEncontradas.push(path);// se agrega al store de ubicaciones no entradas
                }
            }else{ productosNoEncontrados.push(row.code); }// se agrega al store de productos no encontrados
        }else{ filasvacias.push(row); }
    }

    for await (const row of porunir) { // recorrer productos vs ubicaciones que seran unidos
        const exAsoc = await ProductLocationsMD.findOne({ where:{_product:row._product,_location:row._location} });// validacion de existencia de asociacion
        if(!exAsoc){// la asosiacion no existe 
            const Asoc = await ProductLocationsMD.create({_product:row._product,_location:row._location});// inserta/crea la asociacion de producto vs ubicacion
            Asoc ? uniones.exitosas.push(row) : uniones.erroneas.push(row);// valida la creacion erronea o correcta del producto vs ubicacion 
        }else{ yaestaban.push(row); }// si la asociacion existe, la agrega al store de ubicacion vs producto existente
    }

    resp.json({ filasprocesadas:rows.length, filasvacias, productosNoEncontrados, ubicacionesNoEncontradas, porunir, uniones, yaestaban, desuniones });
    console.log("Ubicaciones masivas finalizada...");
}
