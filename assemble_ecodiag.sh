#!/bin/bash

mkdir -p public

function assemble {
  TARGET=$1

  cp -R src/ $TARGET

  echo "source:"
  ls src/

  echo ""
  echo "target:"
  ls -lR $TARGET
  echo ""
  echo ""

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
}

REV=`cat stable_version.txt`

assemble public/head

git clone . tmp
cd tmp
git checkout $REV
assemble ../public
cd ..
rm -rf tmp
