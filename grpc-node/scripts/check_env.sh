#!/usr/bin/env ruby

require 'json'
require 'time'

envfile=ARGV[0]||".env"

file = File.open(envfile)
file.readlines.map(&:chomp).each do |item|
  cnt = 0
  begin 
    if item.split("=")[0]=="ARWEAVE_WALLET_CREDENTIAL" 
      # if ARWEAVE_WALLET_CREDENTIAL
      walletAttrs = [ "kty", "n", "e", "d", "p", "q", "dp", "dq", "qi"]

      wallet = JSON.parse(item.split("=")[1])
      # print wallet
      wallet.each do |k, v|
        walletAttrs.delete(k.strip)
        if v=="" || /[\*]+/.match(v) 
          p "not okay. you need to setup correct arweave wallet credentials. (**)"
          exit(1)
        end
      end
      if walletAttrs.length==0
        p "okay"
        exit(0)
      else
        p "not okay. you need to setup correct arweave wallet credentials. (keys error)"
        exit(1)
      end
    end

  rescue => e
    p e.message
    p "not okay. you need to setup correct arweave wallet credentials. "
    exit(1)
  end
end
p "Okay. However, the env doesn't have owner wallet credential. "
exit(0)
