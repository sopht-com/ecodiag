#/bin/bash

git rev-parse --short HEAD > stable_version.txt
git commit stable_version.txt -m "bump to head"

