#!/bin/bash

TARGET=$1

if [ ! -e public ]; then
  mkdir public
fi

mkdir -p $TARGET

ls -R public/

cp -R src/ $TARGET
VERHASH=`git rev-parse --short HEAD`
VERDATE=`git log -1 --pretty=format:"%ci" | cut -f 1 -d " "`

echo "VERHASH: $VERHASH"
echo "VERDATE: $VERDATE"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  sed -i 's/\%version_hash\%/'$VERHASH'/g' $TARGET/index.html
  sed -i 's/\%version_date\%/'$VERDATE'/g' $TARGET/index.html
else
  sed -i "" 's/\%version_hash\%/'$VERHASH'/g' $TARGET/index.html
  sed -i "" 's/\%version_date\%/'$VERDATE'/g' $TARGET/index.html
fi

grep "EcoDiag version" $TARGET/index.html
