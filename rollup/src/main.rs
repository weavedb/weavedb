mod kv;
mod server;
use clap::Parser;

#[derive(Parser, Debug)]
#[command(name = "weavedb")]
pub struct Args {
    #[arg(long, default_value_t = 6363)]
    pub port: u16,

    #[arg(long, default_value = ".db")]
    pub db: String,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    kv::init(&args.db);
    
    server::run_server(args.port).await;
}
