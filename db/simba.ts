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
    if( (nday!=7) && (now.isBetween(hourstart,hourend)) ){
        const simbainit = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
        console.log(`\n${simbainit}`);
        let WRHGEN:any=[], WRHDES:any=[] ;

        let rset:any = { SAN:[], PAN:[] };

        console.time('SELECTS');
        const CEDISSANrows:Array<any> = await fsol.query(
            `
                SELECT DISTINCT
                ARTICULO,
                GRAL,
                DESCOMPUESTO,
                TOTAL
                FROM (

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_ENT.FECENT AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LEN ON F_LEN.ARTLEN = F_STO.ARTSTO)
                INNER JOIN F_ENT ON F_ENT.TIPENT = F_LEN.TIPLEN AND F_ENT.CODENT = F_LEN.CODLEN)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES" 

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FRE.FECFRE AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFR ON F_LFR.ARTLFR = F_STO.ARTSTO)
                INNER JOIN F_FRE ON F_FRE.TIPFRE = F_LFR.TIPLFR AND F_FRE.CODFRE = F_LFR.CODLFR)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FRD.FECFRD AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFD ON F_LFD.ARTLFD = F_STO.ARTSTO)
                INNER JOIN F_FRD ON F_FRD.TIPFRD = F_LFD.TIPLFD AND F_FRD.CODFRD = F_LFD.CODLFD)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FAC.FECFAC AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFA ON F_LFA.ARTLFA = F_STO.ARTSTO)
                INNER JOIN F_FAC ON F_FAC.TIPFAC = F_LFA.TIPLFA AND F_FAC.CODFAC = F_LFA.CODLFA)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FAB.FECFAB AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFB ON F_LFB.ARTLFB = F_STO.ARTSTO)
                INNER JOIN F_FAB ON F_FAB.TIPFAB = F_LFB.TIPLFB AND F_FAB.CODFAB = F_LFB.CODLFB)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_TRA.FECTRA AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LTR ON F_LTR.ARTLTR = F_STO.ARTSTO)
                INNER JOIN F_TRA ON F_TRA.DOCTRA = F_LTR.DOCLTR)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_FCO.FECFCO AS FECHA
                FROM ((((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_LFC ON F_LFC.ARTLFC = F_STO.ARTSTO)
                INNER JOIN F_FCO ON F_FCO.CODFCO = F_LFC.CODLFC)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES"

                UNION

                SELECT DISTINCT
                F_STO.ARTSTO AS ARTICULO,
                GEN.ACTSTO AS GRAL,
                DES.ACTSTO AS DESCOMPUESTO,
                GEN.ACTSTO + DES.ACTSTO AS TOTAL,
                F_CIN.FECCIN AS FECHA
                FROM (((F_STO 
                INNER JOIN F_STO AS GEN ON GEN.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_STO AS DES ON DES.ARTSTO = F_STO.ARTSTO)
                INNER JOIN F_CIN ON F_CIN.ARTCIN = F_STO.ARTSTO)
                WHERE GEN.ALMSTO = "GEN" AND DES.ALMSTO = "DES")

                WHERE FECHA = #2022-03-01#;
            `
        );
        // const CEDISPANrows:Array<any> = await fsol.query('SELECT ALMSTO,ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="PAN" ORDER BY ARTSTO;');
        console.log("Productos modificados hoy",CEDISSANrows.length);
        console.timeEnd('SELECTS');
        
        console.time('UPDATEDS');
        if(CEDISSANrows.length){
            console.log("Sincronizando CEDISSAP (GENERAL y DESCOMPUESTO)");
            for await ( const row of CEDISSANrows ){
                const [results]:any = await vizapi.query(`
                    UPDATE product_stock STO
                        INNER JOIN products P ON P.id = STO._product
                        INNER JOIN workpoints W ON W.id = STO._workpoint
                    SET
                        STO.stock="${row.TOTAL}",
                        STO.gen="${row.GRAL}",
                        STO.des="${row.DESCOMPUESTO}"
                    WHERE P.code="${row.ARTICULO}" AND W.id=1;
                `);
                if(results.changedRows){ rset.SAN.push({code:row.ARTICULO}); }
            };
        }

        // if(CEDISPANrows.length){
        //     console.log("Sincronizando CEDIS PANTACO...");
        //     for await (const row of CEDISPANrows) {
        //         const [results]:any = await vizapi.query(`
        //             UPDATE product_stock STO
        //                 INNER JOIN products P ON P.id = STO._product
        //                 INNER JOIN workpoints W ON W.id = STO._workpoint
        //             SET gen=${row.ACTSTO}
        //             WHERE P.code="${row.ARTSTO}" AND W.id=2;
        //         `);
        //         if(results.changedRows){ rset.PAN.push({code:row.ARTSTO}); }
        //     }
        // }

        // console.log("FILAS TOTALES:",(CEDISSANrows.length+CEDISPANrows.length));
        console.log("CEDISSAN:",CEDISSANrows.length," UPDATEDS:",rset.SAN.length);
        // console.log("CEDISPAN:",CEDISPANrows.length," UPDATEDS:",rset.PAN.length);

        const simbaends = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado...`;
        console.log(`${simbaends}\n`);
        console.timeEnd('UPDATEDS');
    }else{
        console.log("lazy day!",nday);
    }
}