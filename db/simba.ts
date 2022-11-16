import accdb from 'node-adodb';
import moment from 'moment';
import vizapi from '../db/vizapi';
const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);

export const SIMBA = async()=>{
    const hourstart = moment('08:55:00', 'hh:mm:ss');
    const hourend = moment('21:00:00', 'hh:mm:ss');
    const now = moment();
    const nday:any = moment().format("d");
    const workpoint = JSON.parse((process.env.WORKPOINT||""));

    // Se ejecuta todos los dias que no son domingo entre las 8:55 am hasta las 9:00 pm

    try {
        if( (nday!=7) && (now.isBetween(hourstart,hourend)) ){
            const simbainit = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
            console.log(`\n${simbainit}`);
            // let WRHGEN:any=[], WRHDES:any=[] ;
    
            let rset:any = { SAN:[], PAN:[] };
    
            console.time('SELECTS');
            const CEDISSANrows:Array<any> = await fsol.query(
                `SELECT
                    F_STO.ARTSTO AS CODIGO,
                    SUM(IIF(F_STO.ALMSTO = "GEN", F_STO.ACTSTO,0)) AS GEN,
                    SUM(IIF(F_STO.ALMSTO = "236", F_STO.ACTSTO,0)) AS V23,
                    SUM(IIF(F_STO.ALMSTO = "LRY",F_STO.ACTSTO,0)) AS LRY,
                    SUM(IIF(F_STO.ALMSTO = "STC", F_STO.ACTSTO,0)) AS STC,
                    SUM(IIF(F_STO.ALMSTO = 'DES', F_STO.ACTSTO,0 )) AS DES
                FROM F_STO GROUP BY F_STO.ARTSTO;`
            );
            const CEDISPANrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="PAN" ORDER BY ARTSTO;');
            console.timeEnd('SELECTS');
            
            console.time('UPDATEDS');
            if(CEDISSANrows.length){
                console.log("Sincronizando CEDISSAP (GENERAL y DESCOMPUESTO)");
                for await ( const row of CEDISSANrows ){
                    const [results]:any = await vizapi.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                        SET
                            STO.stock= ${row.GEN},
                            STO.gen= ${row.GEN},
                            STO.V23 = ${row.V23},
                            STO.LRY = ${row.LRY},
                            STO.STC = ${row.STC},
                            STO.des= ${row.DES}
                        WHERE P.code="${row.CODIGO}" AND STO._workpoint = 1`);
                    if(results.changedRows){ rset.SAN.push({code:row.CODIGO}); }
                };
            }
    
            if(CEDISPANrows.length){
                console.log("Sincronizando CEDIS PANTACO...");
                for await (const row of CEDISPANrows) {
                    const [results]:any = await vizapi.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                            INNER JOIN workpoints W ON W.id = STO._workpoint
                        SET
                            STO.stock="${row.ACTSTO}",
                            STO.gen=${row.ACTSTO}
                        WHERE P.code="${row.ARTSTO}" AND W.id=2;
                    `);
                    if(results.changedRows){ rset.PAN.push({code:row.ARTSTO}); }
                }
            }
    
            console.log("FILAS TOTALES:",(CEDISSANrows.length+CEDISPANrows.length));
            console.log("CEDISSAN:",CEDISSANrows.length," UPDATEDS:",rset.SAN.length);
            console.log("CEDISPAN:",CEDISPANrows.length," UPDATEDS:",rset.PAN.length);
    
            const simbaends = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado...`;
            console.log(`${simbaends}\n`);
            console.timeEnd('UPDATEDS');
        }else{ console.log("lazy day!",nday); }
    } catch (error) {
        console.error(error);
        console.log("El programa tuvo un error de jecucion, esperando siguiente vuelta...");
    }
}