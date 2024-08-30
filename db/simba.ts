import accdb from 'node-adodb';
import moment from 'moment';
import vizapi from '../db/vizapi';
const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);

export const SIMBA = async()=>{
    const hourstart = moment('08:55:00', 'hh:mm:ss');
    const hourend = moment('22:00:00', 'hh:mm:ss');
    const now = moment();
    const nday:any = moment().format("d");
    const workpoint = JSON.parse((process.env.WORKPOINT||""));

    // Se ejecuta todos los dias que no son domingo desde las 8:55 am hasta las 9:00 pm

    try {
        if((now.isBetween(hourstart,hourend)) ){
            const simbainit = `\n[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
            console.log(`\n${simbainit}`);
    
            let rset:any = { SAN:[], PAN:[], TCO:[], BOL:[] };
    
            console.time('SELECTS');
            const CEDISSANrows:Array<any> = await fsol.query(
                `SELECT
                    F_STO.ARTSTO AS CODIGO,
                    SUM(IIF(F_STO.ALMSTO = "GEN", F_STO.ACTSTO,0)) AS GEN,
                    SUM(IIF(F_STO.ALMSTO = "236", F_STO.ACTSTO,0)) AS V23,
                    SUM(IIF(F_STO.ALMSTO = "LRY",F_STO.ACTSTO,0)) AS LRY,
                    SUM(IIF(F_STO.ALMSTO = 'DES', F_STO.ACTSTO,0 )) AS DES,
                    SUM(IIF(F_STO.ALMSTO = 'RTA', F_STO.ACTSTO,0 )) AS RTA
                FROM F_STO GROUP BY F_STO.ARTSTO;`
            );
            const CEDISTCOrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="STC" ORDER BY ARTSTO;');
            const CEDISPANrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="PAN" ORDER BY ARTSTO;');
            const CEDISBOLrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="BOL" ORDER BY ARTSTO;');
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
                            STO.des= ${row.DES},
                            STO.in_transit = ${row.RTA}
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
                        WHERE P.code="${row.ARTSTO}" AND W.id=21;
                    `);
                    if(results.changedRows){ rset.PAN.push({code:row.ARTSTO}); }
                }
            }

            if(CEDISTCOrows.length){
                console.log("Sincronizando CEDIS TEXCOCO...");
                for await (const row of CEDISTCOrows) {
                    const [results]:any = await vizapi.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                            INNER JOIN workpoints W ON W.id = STO._workpoint
                        SET
                            STO.stock="${row.ACTSTO}",
                            STO.gen=${row.ACTSTO}
                        WHERE P.code="${row.ARTSTO}" AND W.id=2;
                    `);
                    if(results.changedRows){ rset.TCO.push({code:row.ARTSTO}); }
                }
            }

            if(CEDISBOLrows.length){
                console.log("Sincronizando CEDIS BOLIVIA...");
                for await (const row of CEDISBOLrows) {
                    const [results]:any = await vizapi.query(`
                        UPDATE product_stock STO
                            INNER JOIN products P ON P.id = STO._product
                            INNER JOIN workpoints W ON W.id = STO._workpoint
                        SET
                            STO.stock="${row.ACTSTO}",
                            STO.gen=${row.ACTSTO}
                        WHERE P.code="${row.ARTSTO}" AND W.id=24;
                    `);
                    if(results.changedRows){ rset.BOL.push({code:row.ARTSTO}); }
                }
            }
    
            // console.log("FILAS TOTALES:",(CEDISSANrows.length+CEDISTCOrows.length+CEDISBOLrows.length+CEDISPANrows.length));
            console.log("FILAS TOTALES:",(CEDISSANrows.length+CEDISTCOrows.length+CEDISPANrows.length+CEDISBOLrows.length));
            console.log("CEDISSAN:",CEDISSANrows.length," UPDATEDS:",rset.SAN.length);
            console.log("CEDISPAN:",CEDISTCOrows.length," UPDATEDS:",rset.TCO.length);
            console.log("CEDISBOL:",CEDISBOLrows.length," UPDATEDS:",rset.BOL.length);
            console.log("CEDISTCO:",CEDISPANrows.length," UPDATEDS:",rset.PAN.length);
    
            const simbaends = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado, siguiente vuelta en 10 segundos...`;
            console.timeEnd('UPDATEDS');
            console.log(`${simbaends}\n`);
            setTimeout(() => { SIMBA(); }, 10000);
        }else{ setTimeout(() => { SIMBA(); }, 300000); }
    } catch (error) {
        console.error(error);
        console.log("El programa tuvo un error de jecucion, esperando siguiente vuelta en 10s...");
        setTimeout(() => { SIMBA(); }, 10000);
    }
}