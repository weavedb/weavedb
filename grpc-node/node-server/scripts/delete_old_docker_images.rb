#!/usr/bin/env ruby

require 'json'
require 'time'

if ARGV.length==0 then
  p "error cuz of no specify image name"
  exit
end 

REPO=ARGV[0]
REGION="eu-west-1"


CMD = " aws ecr  describe-images \
 --repository-name #{REPO} \
 --max-items 300 \
 --region #{REGION} \
 --output json "

# p CMD
output=`#{CMD}`
jdata = JSON.parse(output)
#p jdata["imageDetails"][0]
cnt=0
keepNum=8000

jdata['imageDetails'].each do |item|
  #p item
  p cnt.to_s + ": " + item['imageDigest']
  t = item['imagePushedAt']

  # delete versions which is older than 2 weeks. We should keep latest at least 100 versions.
  cnt = cnt + 1
  if cnt > keepNum then
    # t = Time.parse(item['DateCreated'])
    n = Time.now
    if (n.to_i - t.to_i) > ((3600*24)*7*2) then
      # more than 2 week
      p "it's more than 2 week. => delete"

      cmd =" aws ecr batch-delete-image"
      cmd+= " --repository-name #{REPO} --region #{REGION} "
      cmd+=" --image-ids imageDigest=" + item['imageDigest']
      p cmd
      p `#{cmd}`
    else
      p "it's less than 2 week"
    end
  # else
  #   p ""
  end

end
exit
