#!/bin/bash

# Download the latest.zip file
curl -LO https://iden3-circuits-bucket.s3.eu-west-1.amazonaws.com/latest.zip

# Unzip the file into ./circuits
unzip -d ./circuits latest.zip

# remove the zip file
rm latest.zip
