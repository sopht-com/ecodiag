#!/bin/bash

cp -R src/ public
VERHASH=`git rev-parse --short HEAD`
VERDATE=`git log -1 --pretty=format:"%ci" | cut -f 1 -d " "`

echo "VERHASH: $VERHASH"
echo "VERDATE: $VERDATE"

sed -i "" 's/\%version_hash\%/'$VERHASH'/g' public/index.html
sed -i "" 's/\%version_date\%/'$VERDATE'/g' public/index.html

grep "EcoDiag version" public/index.html
