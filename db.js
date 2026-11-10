import { Pool } from "pg"


const pool = new Pool({
    database: "sistemabarbearia", 
    user: "postgres", 
    host: "localhost", 
    port: 5432,
    password: "senai"
});

export default pool; 