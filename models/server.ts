import express, {Application} from 'express'
import cors from 'cors'

import vizapidb from '../db/vizapi'
import fsolRoutes from '../routes/fsol'
import accRoutes from '../routes/accounts'
import wkpRoutes from '../routes/workpoints'
import helpersRoutes from '../routes/helpers'
import { SIMBA } from '../db/simba'

class Server{

    private app:Application;
    private port:string;
    private paths = {
        fsol: "/fsol",
        gsol: '/gsol',
        accounts: '/accounts',
        workpoints: '/workpoints',
        helpers:'/helpers'
    }

    constructor(){
        this.app = express();
        this.port = process.env.PORT || "2200";

        this.vizapidb();
        this.middlewares();
        this.routes();
    }

    async vizapidb(){
        try {
            await vizapidb.authenticate();
            console.log("VizapiDB online!!");
        } catch (error:any) {
            console.log(error);
        }
    }

    middlewares(){
        this.app.use( express.json() );
        this.app.use( express.static('./public') );
    }

    routes(){
        this.app.use(this.paths.fsol, fsolRoutes);
        this.app.use(this.paths.accounts, accRoutes);
        this.app.use(this.paths.workpoints, wkpRoutes);
        this.app.use(this.paths.helpers, helpersRoutes);
    }

    run(){
        this.app.listen( this.port, ()=>{
            console.log("Runing on", this.port, '...');
        });

        // SIMBA();
        // setInterval(()=>{ SIMBA(); }, 240000);
    }
}

export default Server;