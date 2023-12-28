#!/bin/bash

# Download the latest.zip file
curl -LO https://iden3-circuits-bucket.s3.eu-west-1.amazonaws.com/latest.zip

# Unzip the file into ./circuits
unzip -d ./temp latest.zip
mkdir -p ./public/circuits
mv ./temp/credentialAtomicQuerySigV2 ./public/circuits/credentialAtomicQuerySigV2
# remove the zip file
rm -rf ./temp
rm latest.zip
