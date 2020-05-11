#!/bin/bash

function sedi {

  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    sed -i $@
  else
    sed -i "" $@
  fi

}

function assemble {
  TARGET=$1

  mkdir -p $TARGET

  cp -R src/* $TARGET/

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

  

  sedi 's/\%version_hash\%/'$VERHASH'/g' $TARGET/index.html
  sedi 's/\%version_date\%/'$VERDATE'/g' $TARGET/index.html
  sedi 's/deps\/vue.js/deps\/vue.min.js/g' $TARGET/index.html
  sedi 's/deps\/vue-i18n.js/deps\/vue-i18n.min.js/g' $TARGET/index.html

  rm $TARGET/deps/vue.js
  rm $TARGET/deps/vue-i18n.js
  
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
