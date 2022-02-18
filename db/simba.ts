import accdb from 'node-adodb';
import moment from 'moment';
const fsol = accdb.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${process.env.FSOLDB};Persist Security Info=False;`);

export const SIMBA = async()=>{
    const simbainit = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha iniciado...`;
    console.log(`\n${simbainit}`);
    const rows:Array<any> = await fsol.query('SELECT ARTSTO,ACTSTO FROM F_STO WHERE ALMSTO="DES" OR ALMSTO="GEN" ORDER BY ARTSTO;');
    if(rows.length){
        console.log(rows.length,"==> resultados!!");
        console.log(rows[1]);
    }
    const simbaends = `[${moment().format("YYYY/MM/DD h:mm:ss")}]: Simba ha finalizado...`;
    console.log(`${simbaends}\n`);
}