mod kv;
mod server;
mod transform;
mod verify;
mod sign;
mod http_client;
mod hb_client;
mod benchmark;
mod bundler;
mod tester;
#[macro_use]
mod monade;
mod monade_test;
use clap::Parser;


#[derive(Parser, Debug)]
#[command(name = "weavedb")]
pub struct Args {
    #[arg(long, default_value_t = 6363)]
    pub port: u16,

    #[arg(long, default_value = ".db")]
    pub db: String,

    #[arg(long = "hb_port", value_name = "PORT")]
    pub hb_port: Option<u16>,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    kv::init(&args.db);
    
    server::run_server(args.port, args.hb_port).await;
}
