import accdb from 'node-adodb';
import moment from 'moment';
import vizapi from '../db/vizapi';
const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);

export const SIMBA = async()=>{
    console.time('t1');
    const simbainit = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
    console.log(`\n${simbainit}`);
    let WRHGEN:any=[], WRHDES:any=[] ;

    let rset:any = { GEN:[], DES:[], PAN:[] };

    const CEDISSANrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="DES" OR ALMSTO="GEN" ORDER BY ARTSTO;');
    const CEDISPANrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="PAN" ORDER BY ARTSTO;');
    
    // const [metadata,results]:any = await vizapi.query(`
    //             UPDATE product_stock STO
    //                 INNER JOIN products P ON P.id = STO._product
    //                 INNER JOIN workpoints W ON W.id = STO._workpoint
    //             SET gen=500
    //             WHERE P.code="00077" AND W.id="1";
    // `);

    if(CEDISSANrows.length){
        WRHGEN = CEDISSANrows.filter( r => r.ALMSTO=="GEN");
        WRHDES = CEDISSANrows.filter( r => r.ALMSTO=="DES");
        
        for await (const row of WRHGEN) {
            const [results]:any = await vizapi.query(`
                UPDATE product_stock STO
                    INNER JOIN products P ON P.id = STO._product
                    INNER JOIN workpoints W ON W.id = STO._workpoint
                SET gen=${row.ACTSTO}
                WHERE P.code="${row.ARTSTO}" AND W.id="1";
            `);
            if(results.changedRows){ rset.GEN.push({code:row.ARTSTO}); console.log(row.ARTSTO,"UPDATED!!!"); }
        }

        for await (const row of WRHDES) {
            const [results]:any = await vizapi.query(`
                UPDATE product_stock STO
                    INNER JOIN products P ON P.id = STO._product
                    INNER JOIN workpoints W ON W.id = STO._workpoint
                SET des=${row.ACTSTO}
                WHERE P.code="${row.ARTSTO}" AND W.id="1";
            `);
            if(results.changedRows){ rset.DES.push({code:row.ARTSTO}); console.log(row.ARTSTO,"UPDATED!!!"); }
        }
    }

    if(CEDISPANrows.length){
        console.log("ALMACEN PANTACO:",CEDISPANrows.length);
        
        for await (const row of CEDISPANrows) {
            const [results]:any = await vizapi.query(`
                UPDATE product_stock STO
                    INNER JOIN products P ON P.id = STO._product
                    INNER JOIN workpoints W ON W.id = STO._workpoint
                SET des=${row.ACTSTO}
                WHERE P.code="${row.ARTSTO}" AND W.id="1";
            `);
            if(results.changedRows){ rset.PAN.push({code:row.ARTSTO}); console.log(row.ARTSTO,"UPDATED!!!"); }
        }
    }

    console.log("FILAS TOTALES:",(CEDISSANrows.length+CEDISPANrows.length));
    console.log("ALMACEN GENERAL:",WRHGEN.length," UPDATEDS:",rset.GEN.length);
    console.log("ALMACEN DESCOMPUESTOS:",WRHDES.length," UPDATEDS:",rset.DES.length);
    console.log("ALMACEN PANTACO:",CEDISPANrows.length," UPDATEDS:",rset.PAN.length);

    const simbaends = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado...`;
    console.log(`${simbaends}\n`);
    console.timeEnd('t1');
}