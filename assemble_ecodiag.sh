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

function configure {
  TARGET=$1

  echo "target:"
  ls -lR $TARGET
  echo ""
  echo ""

  VERHASH=`git rev-parse --short HEAD`
  VERDATE=`git log -1 --pretty=format:"%ci" | cut -f 1 -d " "`
  echo "VERHASH: $VERHASH"
  echo "VERDATE: $VERDATE"
  sedi 's/\%version_hash\%/'$VERHASH'/g' $TARGET
  sedi 's/\%version_date\%/'$VERDATE'/g' $TARGET
  grep "EcoDiag version" $TARGET
}

function assemble_npm {
  mkdir -p $1
  configure src/components/ecodiag.vue
  npm install
  npm ci
  NODE_ENV=production npm run build
  # # mv public public-vue # GitLab Pages hooks on the public folder
  mv dist $1
  # # optionally, you can activate gzip support with the following line:
  # # find ../public/buefy -type f -regex '.*\.\(htm\|html\|txt\|text\|js\|css\)$' -exec gzip -f -k {} \;
}

# generate head
assemble_npm public/head

# generate the official version
REV=`cat stable_version.txt`
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin
git branch -f master origin/master
# git branch -f csv_import origin/csv_import
# git branch -f buefy origin/buefy
git checkout master
git clone . tmp
cd tmp

git checkout $REV
assemble_npm ../public
# git checkout csv_import
# assemble ../public/csv_import
cd ..
rm -rf tmp
